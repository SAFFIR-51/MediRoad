<?php
/** 매물 노출 상태 변경 {id, status: open|closed|hidden} */
require __DIR__ . '/../../app/api.php';
require_post();
require_admin();

$in = input_json();
$id = in_int($in, 'id');
$status = in_str($in, 'status', 10);
if (!is_int($id) || $id < 1) {
    json_error('잘못된 매물 번호입니다.', 400);
}
if (!in_array($status, LISTING_STATUSES, true)) {
    json_error('노출 상태가 올바르지 않습니다.', 422, array('status' => '노출 · 거래완료 · 비노출 중에서 선택해 주세요.'));
}
$row = db_one('SELECT * FROM listings WHERE id = ?', array($id));
if (!$row) {
    json_error('매물을 찾을 수 없습니다.', 404);
}
listing_set_status($row, $status);
json_ok();
