<?php
/** 예시 매물(is_sample=1) 일괄 삭제 — 오픈 전 1회 */
require __DIR__ . '/../../app/api.php';
require_post();
require_admin();

$rows = db_all('SELECT id, images FROM listings WHERE is_sample = 1');
$paths = array();
foreach ($rows as $r) {
    $paths = array_merge($paths, json_list($r['images']));
}
$deleted = db_exec('DELETE FROM listings WHERE is_sample = 1');
listing_delete_upload_files($paths);
json_ok(array('deleted' => $deleted));
