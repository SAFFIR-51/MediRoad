import "server-only";
import { hasDb, one, q } from "@/lib/server/db";

/** 사이트 설정 (현재는 매물 정보 메뉴 노출 하나). DB 가 없으면 노출 상태로 본다. */

export type SiteSettings = { locationMenuVisible: boolean };

export async function getSettings(): Promise<SiteSettings> {
  if (!hasDb()) return { locationMenuVisible: true };
  try {
    const row = await one<{ svalue: string }>("SELECT svalue FROM settings WHERE skey = 'location_menu_visible'");
    return { locationMenuVisible: row ? row.svalue === "1" : true };
  } catch {
    return { locationMenuVisible: true };
  }
}

export async function setLocationMenuVisible(visible: boolean) {
  await q(
    `INSERT INTO settings (skey, svalue) VALUES ('location_menu_visible', $1)
     ON CONFLICT (skey) DO UPDATE SET svalue = EXCLUDED.svalue`,
    [visible ? "1" : "0"],
  );
}
