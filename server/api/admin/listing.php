<?php
/** 관리자 매물 한 건 ?id= (상태와 관계없이) */
require __DIR__ . '/../../app/api.php';
require_method('GET');
require_admin();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$row = $id > 0 ? db_one('SELECT * FROM listings WHERE id = ?', array($id)) : null;
if (!$row) {
    json_error('매물을 찾을 수 없습니다.', 404);
}
json_ok(array('item' => listing_from_row($row)));
