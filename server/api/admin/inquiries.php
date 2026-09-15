<?php
/** 관리자 상담 문의 목록 ?status=new|in_progress|done (최신순 최대 1000건) + 상태별 건수 */
require __DIR__ . '/../../app/api.php';
require_method('GET');
require_admin();

$status = isset($_GET['status']) && is_string($_GET['status']) ? $_GET['status'] : '';
if (in_array($status, INQUIRY_STATUSES, true)) {
    $rows = db_all('SELECT * FROM inquiries WHERE status = ? ORDER BY created_at DESC, id DESC LIMIT 1000', array($status));
} else {
    $rows = db_all('SELECT * FROM inquiries ORDER BY created_at DESC, id DESC LIMIT 1000');
}

$counts = array('new' => 0, 'in_progress' => 0, 'done' => 0);
foreach (db_all('SELECT status, COUNT(*) AS c FROM inquiries GROUP BY status') as $r) {
    $counts[$r['status']] = (int) $r['c'];
}

json_ok(array('items' => array_map('inquiry_from_row', $rows), 'counts' => $counts));
