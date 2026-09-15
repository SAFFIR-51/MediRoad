<?php
/** 관리자 상담 문의 상세 ?id= */
require __DIR__ . '/../../app/api.php';
require_method('GET');
require_admin();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$row = $id > 0 ? db_one('SELECT * FROM inquiries WHERE id = ?', array($id)) : null;
if (!$row) {
    json_error('문의를 찾을 수 없습니다.', 404);
}
json_ok(array('item' => inquiry_from_row($row)));
