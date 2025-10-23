const VERIFY_REDIRECT_PARAM = "redirect";
const VERIFY_REDIRECT_VALUE = "verify";

export const buildVerifyRedirectUrl = (): string => {
  if (typeof window === "undefined") {
    return `/?${VERIFY_REDIRECT_PARAM}=${VERIFY_REDIRECT_VALUE}`;
  }
  return `${window.location.origin}/?${VERIFY_REDIRECT_PARAM}=${VERIFY_REDIRECT_VALUE}`;
};

export const shouldShowVerifyPage = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get(VERIFY_REDIRECT_PARAM) === VERIFY_REDIRECT_VALUE) {
    return true;
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return hashParams.get(VERIFY_REDIRECT_PARAM) === VERIFY_REDIRECT_VALUE;
};

export { VERIFY_REDIRECT_PARAM, VERIFY_REDIRECT_VALUE };

