<?php
/** 관리자 대시보드 숫자 */
require __DIR__ . '/../../app/api.php';
require_method('GET');
require_admin();

json_ok(array(
    'inquiriesNew' => db_count("SELECT COUNT(*) FROM inquiries WHERE status = 'new'"),
    'listingsOpen' => db_count("SELECT COUNT(*) FROM listings WHERE status = 'open'"),
    'listingsClosed' => db_count("SELECT COUNT(*) FROM listings WHERE status = 'closed'"),
    'listingsHidden' => db_count("SELECT COUNT(*) FROM listings WHERE status = 'hidden'"),
    'listingsSample' => db_count('SELECT COUNT(*) FROM listings WHERE is_sample = 1'),
    'members' => db_count("SELECT COUNT(*) FROM users WHERE role = 'member'"),
));
