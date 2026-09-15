<?php
/** 매물 상세 ?code= (회원 전용) + 같은 묶음의 다른 매물 3건 */
require __DIR__ . '/../app/api.php';
require_method('GET');

$u = require_member();
if (!location_menu_visible() && $u['role'] !== 'admin') {
    json_error('현재 매물 정보를 제공하지 않습니다.', 403);
}

$code = isset($_GET['code']) && is_string($_GET['code']) ? trim($_GET['code']) : '';
if (!preg_match('/^[A-Z]-\d{4}-\d{3,6}$/', $code)) {
    json_error('매물을 찾을 수 없습니다.', 404);
}
$row = db_one("SELECT * FROM listings WHERE code = ? AND status = 'open'", array($code));
if (!$row) {
    json_error('매물을 찾을 수 없습니다. 거래가 끝났거나 게시가 중단된 매물일 수 있습니다.', 404);
}

$types = listing_group_types($row['deal_type']);
$related = db_all(
    "SELECT * FROM listings WHERE status = 'open' AND id <> ? AND deal_type IN (" . implode(', ', array_fill(0, count($types), '?')) . ')'
    . ' ORDER BY sort_order DESC, created_at DESC, id DESC LIMIT 3',
    array_merge(array((int) $row['id']), $types)
);

json_ok(array('item' => listing_from_row($row), 'related' => array_map('listing_from_row', $related)));
