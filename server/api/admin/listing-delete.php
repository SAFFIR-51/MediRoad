<?php
/** 매물 삭제 {id} — 업로드한 사진 파일도 함께 삭제 */
require __DIR__ . '/../../app/api.php';
require_post();
require_admin();

$in = input_json();
$id = in_int($in, 'id');
if (!is_int($id) || $id < 1) {
    json_error('잘못된 매물 번호입니다.', 400);
}
$row = db_one('SELECT * FROM listings WHERE id = ?', array($id));
if (!$row) {
    json_error('매물을 찾을 수 없습니다.', 404);
}
db_exec('DELETE FROM listings WHERE id = ?', array($id));
listing_delete_upload_files(json_list($row['images']));
json_ok();
