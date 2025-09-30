export function initOneSignal() {
  if (!window.OneSignal) window.OneSignal = window.OneSignal || [];
  const OneSignal = window.OneSignal;

  OneSignal.push(function () {
    OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      safari_web_id: null,     // 사파리 푸시는 나중에 설정
      notifyButton: { enable: false },
      allowLocalhostAsSecureOrigin: true // 로컬 개발 테스트
    });
  });
}

export async function askPermissionAndGetId() {
  const OneSignal = window.OneSignal;
  await OneSignal.Slidedown.promptPush(); // 권한 요청 UI
  const id = await OneSignal.getUserId();
  return id; // playerId
}