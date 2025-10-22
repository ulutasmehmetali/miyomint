export interface HCaptchaWidgetOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  theme?: "light" | "dark";
  size?: "normal" | "compact" | "invisible";
}

export interface HCaptchaInstance {
  render(
    container: string | HTMLElement,
    options: HCaptchaWidgetOptions
  ): string;
  reset(widgetId?: string): void;
  getResponse(widgetId?: string): string;
  remove?(widgetId: string): void;
}

declare global {
  interface Window {
    hcaptcha?: HCaptchaInstance;
  }
}

export {};
