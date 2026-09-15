<?php
/** 관리자 매물 목록 ?status=&dealType=&q= */
require __DIR__ . '/../../app/api.php';
require_method('GET');
require_admin();

$where = array();
$params = array();

$status = isset($_GET['status']) && is_string($_GET['status']) ? $_GET['status'] : '';
if (in_array($status, LISTING_STATUSES, true)) {
    $where[] = 'status = ?';
    $params[] = $status;
}
$dealType = isset($_GET['dealType']) && is_string($_GET['dealType']) ? $_GET['dealType'] : '';
if (in_array($dealType, LISTING_DEAL_TYPES, true)) {
    $where[] = 'deal_type = ?';
    $params[] = $dealType;
}
$q = isset($_GET['q']) && is_string($_GET['q']) ? trim($_GET['q']) : '';
if ($q !== '') {
    $like = '%' . str_replace(array('\\', '%', '_'), array('\\\\', '\\%', '\\_'), mr_substr($q, 0, 50)) . '%';
    $where[] = '(title LIKE ? OR address LIKE ? OR region LIKE ? OR code LIKE ? OR category LIKE ?)';
    array_push($params, $like, $like, $like, $like, $like);
}

$sql = 'SELECT * FROM listings' . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
    . " ORDER BY FIELD(status, 'open', 'hidden', 'closed'), sort_order DESC, created_at DESC, id DESC";
json_ok(array('items' => array_map('listing_from_row', db_all($sql, $params))));
