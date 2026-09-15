<?php
/** 상담 문의 처리 상태·메모 변경 {id, status?, memo?} */
require __DIR__ . '/../../app/api.php';
require_post();
require_admin();

$in = input_json();
$id = in_int($in, 'id');
if (!is_int($id) || $id < 1) {
    json_error('잘못된 문의 번호입니다.', 400);
}
$row = db_one('SELECT id FROM inquiries WHERE id = ?', array($id));
if (!$row) {
    json_error('문의를 찾을 수 없습니다.', 404);
}

$set = array();
$params = array();
if (array_key_exists('status', $in)) {
    $status = in_str($in, 'status', 20);
    if (!in_array($status, INQUIRY_STATUSES, true)) {
        json_error('처리 상태가 올바르지 않습니다.', 422, array('status' => '신규 · 상담중 · 완료 중에서 선택해 주세요.'));
    }
    $set[] = 'status = ?';
    $params[] = $status;
}
if (array_key_exists('memo', $in)) {
    $set[] = 'memo = ?';
    $params[] = in_str($in, 'memo', 5000);
}
if (!$set) {
    json_error('변경할 내용이 없습니다.', 400);
}
$set[] = 'updated_at = ?';
$params[] = now_str();
$params[] = $id;
db_exec('UPDATE inquiries SET ' . implode(', ', $set) . ' WHERE id = ?', $params);
json_ok();
