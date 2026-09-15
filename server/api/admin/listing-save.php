<?php
/** 매물 등록·수정 (id 가 있으면 수정). 필수값이 빠지면 422 + errors{필드: 메시지} */
require __DIR__ . '/../../app/api.php';
require_post();
require_admin();

$in = input_json();
$id = in_int($in, 'id');
if ($id === false || (is_int($id) && $id < 1)) {
    json_error('잘못된 매물 번호입니다.', 400);
}
$existing = null;
if ($id) {
    $existing = db_one('SELECT * FROM listings WHERE id = ?', array($id));
    if (!$existing) {
        json_error('매물을 찾을 수 없습니다.', 404);
    }
}

list($data, $errors) = listing_validate($in);
if ($errors) {
    json_error('필수 항목을 확인해 주세요.', 422, $errors);
}

$result = listing_save($existing, $data);
json_ok(array('id' => $result['id'], 'code' => $result['code']));
