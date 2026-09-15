<?php
/** HTTP·JSON·입력·세션 헬퍼 */

function json_out(array $data, $status = 200)
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_ok(array $data = array())
{
    json_out(array('ok' => true) + $data);
}

function json_error($message, $status = 400, $errors = null)
{
    $data = array('ok' => false, 'error' => $message);
    if ($errors) {
        $data['errors'] = $errors;
    }
    json_out($data, $status);
}

function request_method()
{
    return isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';
}

function require_method($method)
{
    if (request_method() !== $method) {
        header('Allow: ' . $method);
        json_error('허용되지 않는 요청 방식입니다.', 405);
    }
}

/** 상태를 바꾸는 요청은 X-Requested-With: mediroad 헤더 필수 (다른 사이트의 폼 전송 차단) */
function require_csrf_header()
{
    $h = isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? $_SERVER['HTTP_X_REQUESTED_WITH'] : '';
    if (strtolower($h) !== 'mediroad') {
        json_error('잘못된 요청입니다.', 403);
    }
}

function require_post()
{
    require_method('POST');
    require_csrf_header();
}

/** JSON 본문 (배열). 형식이 틀리면 400 */
function input_json()
{
    static $data = null;
    if ($data !== null) {
        return $data;
    }
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        $data = array();
        return $data;
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        json_error('요청 형식이 올바르지 않습니다.', 400);
    }
    $data = $decoded;
    return $data;
}

function mr_strlen($s)
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen(utf8_decode($s));
}

function mr_substr($s, $start, $len)
{
    return function_exists('mb_substr') ? mb_substr($s, $start, $len, 'UTF-8') : substr($s, $start, $len);
}

/** 문자열 입력: trim + 길이 제한. 문자열·숫자가 아니면 '' */
function in_str(array $in, $key, $max = 255)
{
    if (!array_key_exists($key, $in) || $in[$key] === null) {
        return '';
    }
    $v = $in[$key];
    if (is_int($v) || is_float($v)) {
        $v = (string) $v;
    }
    if (!is_string($v)) {
        return '';
    }
    $v = trim(str_replace("\0", '', $v));
    if (mr_strlen($v) > $max) {
        $v = mr_substr($v, 0, $max);
    }
    return $v;
}

/** 정수 입력: 비어 있으면 null, 정수가 아니면 false ("1,300" 은 1300 으로 인정) */
function in_int(array $in, $key)
{
    if (!array_key_exists($key, $in) || $in[$key] === null || $in[$key] === '') {
        return null;
    }
    $v = $in[$key];
    if (is_bool($v)) {
        return false;
    }
    if (is_int($v)) {
        return $v;
    }
    if (is_float($v)) {
        return (floor($v) == $v && abs($v) < 2147483647) ? (int) $v : false;
    }
    if (is_string($v)) {
        $s = str_replace(array(',', ' '), '', trim($v));
        if ($s === '') {
            return null;
        }
        if (preg_match('/^-?\d{1,9}$/', $s)) {
            return (int) $s;
        }
    }
    return false;
}

/** 실수 입력: 비어 있으면 null, 숫자가 아니면 false */
function in_float(array $in, $key)
{
    if (!array_key_exists($key, $in) || $in[$key] === null || $in[$key] === '') {
        return null;
    }
    $v = $in[$key];
    if (is_bool($v)) {
        return false;
    }
    if (is_int($v) || is_float($v)) {
        return (float) $v;
    }
    if (is_string($v)) {
        $s = str_replace(array(',', ' '), '', trim($v));
        if ($s === '') {
            return null;
        }
        if (preg_match('/^-?\d+(\.\d+)?$/', $s)) {
            return (float) $s;
        }
    }
    return false;
}

function in_bool(array $in, $key)
{
    if (!array_key_exists($key, $in)) {
        return false;
    }
    $v = $in[$key];
    return $v === true || $v === 1 || $v === '1' || $v === 'true' || $v === 'on';
}

function now_str($offsetSec = 0)
{
    return date('Y-m-d H:i:s', time() + $offsetSec);
}

function client_ip()
{
    return isset($_SERVER['REMOTE_ADDR']) ? substr($_SERVER['REMOTE_ADDR'], 0, 45) : '';
}

function is_https()
{
    if (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') {
        return true;
    }
    if (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443) {
        return true;
    }
    return isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https';
}

/** 로그인 후 이동할 내부 경로만 허용 (/ 로 시작, // · \ · 제어문자 금지) */
function mr_safe_next($next, $fallback = '/')
{
    if (!is_string($next) || $next === '' || $next[0] !== '/' || strlen($next) > 1000) {
        return $fallback;
    }
    if (substr($next, 0, 2) === '//' || strpos($next, '\\') !== false || preg_match('/[\x00-\x1f\x7f]/', $next)) {
        return $fallback;
    }
    return $next;
}

/**
 * 세션 시작. 쿠키 MRSESSID (HttpOnly · SameSite=Lax · HTTPS 면 Secure, 7일).
 * $readOnly 면 읽기만 하고 바로 닫는다 (router 에서 사용).
 */
function mr_session_start($readOnly = false)
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $lifetime = 7 * 24 * 3600;
    session_name(MR_SESSION_NAME);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', (string) $lifetime);
    session_set_cookie_params(array(
        'lifetime' => $lifetime,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ));
    $dir = MR_APP_DIR . '/storage/sessions';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    if (is_dir($dir) && is_writable($dir)) {
        session_save_path($dir);
        ini_set('session.gc_probability', '1');
        ini_set('session.gc_divisor', '100');
    }
    if ($readOnly) {
        session_start(array('read_and_close' => true));
    } else {
        session_start();
    }
}

/** 세션 쿠키가 있을 때만 세션을 연다 (게스트는 세션을 만들지 않음) */
function mr_session_resume()
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return true;
    }
    if (empty($_COOKIE[MR_SESSION_NAME])) {
        return false;
    }
    mr_session_start();
    return true;
}
