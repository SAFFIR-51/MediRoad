<?php
/** 공개 설정 (매물 정보 메뉴 노출 여부) */
require __DIR__ . '/../app/api.php';
require_method('GET');

json_ok(array('settings' => array('locationMenuVisible' => location_menu_visible())));
