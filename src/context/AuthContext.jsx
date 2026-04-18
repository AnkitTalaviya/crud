import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { REMINDER_DEFAULT_VALUES } from '@/utils/constants';
import { ensureUserProfile, getAccessRequest, subscribeToAccessRequest, subscribeToUserProfile } from '@/services/profile.service';
import { getAccessState } from '@/utils/access';
import { getFriendlyWorkspaceError } from '@/utils/errors';
import { clearSignupIntent } from '@/utils/signupIntent';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [accountRequest, setAccountRequest] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let unsubscribeProfile = () => {};
    let unsubscribeAccessRequest = () => {};

    const startProfileSubscription = (firebaseUser) => {
      unsubscribeProfile();
      unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (profile) => {
        clearSignupIntent();
        setAccountRequest(null);
        setUserProfile(profile);
        setProfileReady(true);
      });
    };

    const startAccessRequestSubscription = (firebaseUser, pendingRequest = null) => {
      unsubscribeAccessRequest();
      unsubscribeAccessRequest = subscribeToAccessRequest(firebaseUser.uid, async (request) => {
        const resolvedRequest = request ?? pendingRequest;
        setAccountRequest(resolvedRequest);

        if (request) {
          clearSignupIntent();
        }

        if (request?.status === 'approved') {
          try {
            const result = await ensureUserProfile(firebaseUser);

            if (result.mode === 'profile') {
              startProfileSubscription(firebaseUser);
              return;
            }
          } catch (error) {
            console.error('Could not activate the approved workspace request', error);
            setProfileError(getFriendlyWorkspaceError(error));
          }
        }

        setUserProfile(null);
        setProfileReady(true);
      });
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribeProfile();
      unsubscribeAccessRequest();
      setUser(firebaseUser);
      setProfileError('');
      setAccountRequest(null);

      if (!firebaseUser) {
        setUserProfile(null);
        setAuthReady(true);
        setProfileReady(true);
        return;
      }

      setAuthReady(true);
      setProfileReady(false);

      try {
        const result = await ensureUserProfile(firebaseUser);

        if (result.mode === 'request') {
          startAccessRequestSubscription(firebaseUser, result.request ?? null);
          return;
        }

        startProfileSubscription(firebaseUser);
      } catch (error) {
        if (error?.code === 'permission-denied') {
          try {
            const pendingRequest = await getAccessRequest(firebaseUser.uid);

            if (pendingRequest) {
              startAccessRequestSubscription(firebaseUser, pendingRequest);
              return;
            }
          } catch (requestError) {
            console.error('Could not recover profile bootstrap from access request state', requestError);
          }
        }

        console.error('Could not prepare the user profile', error);
        setUserProfile(null);
        setProfileError(getFriendlyWorkspaceError(error));
        setProfileReady(true);
      }
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAccessRequest();
      unsubscribeAuth();
    };
  }, []);

  const value = useMemo(() => {
    const access = getAccessState(userProfile);

    return {
      user,
      userProfile,
      accountRequest,
      role: access.role,
      accountStatus: access.status,
      workspaceId: userProfile?.workspaceId ?? null,
      reminderPreferences: userProfile?.reminderPreferences ?? REMINDER_DEFAULT_VALUES,
      authReady,
      profileReady,
      sessionReady: authReady && profileReady,
      isAuthenticated: Boolean(user),
      profileError,
      isActiveMember: access.isActive,
      canManageWorkspace: access.canManageWorkspace,
      canManageRoles: access.canManageRoles,
      canViewTeam: access.canViewTeam,
      isViewer: access.isViewer,
    };
  }, [accountRequest, authReady, profileError, profileReady, user, userProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
