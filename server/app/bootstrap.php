<?php
/**
 * 메디로드 PHP 공용 부트스트랩 (카페24 웹호스팅, PHP 7.4 이상)
 *
 * router.php · api/*.php · install/index.php 가 가장 먼저 불러온다. 이 파일은 아무것도 출력하지 않는다.
 * 설정은 app/config.php (없고 환경변수 MR_DB_HOST 가 있으면 config.sample.php 를 환경변수로 읽음 — 로컬 docker 용).
 */
if (defined('MR_BOOTED')) {
    return;
}
define('MR_BOOTED', true);
define('MR_APP_DIR', __DIR__);
define('MR_WEB_ROOT', dirname(__DIR__));
define('MR_SESSION_NAME', 'MRSESSID');

date_default_timezone_set('Asia/Seoul');
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
if (is_dir(MR_APP_DIR . '/storage') && is_writable(MR_APP_DIR . '/storage')) {
    ini_set('error_log', MR_APP_DIR . '/storage/php-error.log');
}
if (function_exists('mb_internal_encoding')) {
    mb_internal_encoding('UTF-8');
}

require_once __DIR__ . '/lib/config.php';
require_once __DIR__ . '/lib/http.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/lib/settings.php';
require_once __DIR__ . '/lib/mail.php';
require_once __DIR__ . '/lib/listings.php';
require_once __DIR__ . '/lib/inquiries.php';
