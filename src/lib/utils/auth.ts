import { InstagramAuth } from '@/types/auth';

export const INSTAGRAM_HOSTNAME = 'www.instagram.com';

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const getInstagramAuth = (): InstagramAuth | null => {
  const ds_user_id = getCookie('ds_user_id');
  const csrftoken = getCookie('csrftoken');

  if (!ds_user_id || !csrftoken) return null;

  return {
    ds_user_id,
    csrftoken,
  };
};

export const verifyHostname = (): boolean => {
  return window.location.hostname === INSTAGRAM_HOSTNAME;
};

export const isAuthenticated = (): boolean => {
  return !!getInstagramAuth() && verifyHostname();
}; 