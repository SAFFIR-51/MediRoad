<?php
/** 매물 목록 (회원 전용, 노출 중인 매물만) */
require __DIR__ . '/../app/api.php';
require_method('GET');

$u = require_member();
if (!location_menu_visible() && $u['role'] !== 'admin') {
    json_error('현재 매물 정보를 제공하지 않습니다.', 403);
}

$rows = db_all("SELECT * FROM listings WHERE status = 'open' ORDER BY sort_order DESC, created_at DESC, id DESC");
json_ok(array('items' => array_map('listing_from_row', $rows)));
