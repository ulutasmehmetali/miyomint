export const getAppBaseUrl = () => {
  if (typeof window === "undefined") {
    return "https://www.miyomint.com.tr";
  }

  const origin = window.location.origin;
  return origin.includes("localhost") ? origin : "https://www.miyomint.com.tr";
};

