<?php
/** 관리자 설정 저장 {locationMenuVisible} */
require __DIR__ . '/../../app/api.php';
require_post();
require_admin();

$in = input_json();
if (!array_key_exists('locationMenuVisible', $in)) {
    json_error('변경할 설정이 없습니다.', 400);
}
$visible = in_bool($in, 'locationMenuVisible');
setting_set('location_menu_visible', $visible ? '1' : '0');
json_ok(array('settings' => array('locationMenuVisible' => $visible)));
