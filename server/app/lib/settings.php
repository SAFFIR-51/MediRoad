<?php
/** 사이트 설정 (settings 테이블: skey → svalue) */

function setting_get($key, $default = null)
{
    $row = db_one('SELECT svalue FROM settings WHERE skey = ?', array($key));
    return $row ? $row['svalue'] : $default;
}

function setting_set($key, $value)
{
    db_exec(
        'INSERT INTO settings (skey, svalue) VALUES (?, ?) ON DUPLICATE KEY UPDATE svalue = VALUES(svalue)',
        array($key, (string) $value)
    );
}

/** 헤더 "매물 정보" 메뉴 노출 여부 (기본 노출) */
function location_menu_visible()
{
    return setting_get('location_menu_visible', '1') !== '0';
}
