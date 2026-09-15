<?php
/**
 * 페이지 라우터 (카페24 웹호스팅)
 *
 * .htaccess 가 디렉터리·.html·없는 경로 요청을 이 파일로 보낸다.
 *  1) 주소 정리: 옛 /consulting 주소 301, /x/index.html · /x.html → /x/, 슬래시 없는 경로 → 슬래시 붙여 301
 *  2) 접근 제어: /location/ 회원 전용(미노출 설정이면 관리자만), /admin/ 관리자 전용, 로그인 상태의 /login/ · /signup/ → next
 *  3) next build 결과 HTML(<경로>/index.html)의 <html lang="ko"> 에 data-auth · data-loc 속성을 넣어 내보낸다
 * DB·설정이 아직 없어도(설치 전) 페이지는 게스트 기준으로 보인다.
 */
require __DIR__ . '/app/bootstrap.php';

const MR_LEGACY_REDIRECTS = array(
    '/consulting' => '/analysis/',
    '/consulting/opening' => '/analysis/clinic/',
    '/consulting/pharmacy' => '/analysis/pharmacy/',
    '/consulting/transfer' => '/analysis/transfer/',
    '/consulting/marketing' => '/support/marketing/',
    '/consulting/closure' => '/support/closure/',
    '/consulting/roadmap' => '/analysis/clinic/',
);

function router_redirect($location, $status = 302)
{
    header('Location: ' . $location, true, $status);
    header('Cache-Control: no-cache');
    exit;
}

function router_render($file, $status, $auth, $locOn, $private)
{
    $html = @file_get_contents($file);
    if ($html === false) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        echo '페이지를 읽을 수 없습니다.';
        exit;
    }
    $needle = '<html lang="ko"';
    $pos = strpos($html, $needle);
    if ($pos !== false) {
        $attrs = ' data-auth="' . $auth . '" data-loc="' . ($locOn ? 'on' : 'off') . '"';
        $html = substr_replace($html, $needle . $attrs, $pos, strlen($needle));
    }
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: ' . ($private ? 'private, no-cache, no-store' : 'no-cache'));
    if ($private) {
        header('X-Robots-Tag: noindex, nofollow');
    }
    header('Content-Length: ' . strlen($html));
    if (request_method() !== 'HEAD') {
        echo $html;
    }
    exit;
}

function router_not_found($auth, $locOn)
{
    $file = MR_WEB_ROOT . '/404.html';
    if (is_file($file)) {
        router_render($file, 404, $auth, $locOn, false);
    }
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not Found';
    exit;
}

// ---- 로그인·노출 상태 (설정·DB 가 없으면 게스트, 노출 on) ----
$user = null;
$locOn = true;
if (mr_config()) {
    try {
        if (!empty($_COOKIE[MR_SESSION_NAME])) {
            mr_session_start(true);
            $user = current_user();
        }
        $locOn = location_menu_visible();
    } catch (Throwable $e) {
        // 설치 전(테이블 없음, 42S02)은 정상 상태라 기록하지 않는다
        if (!($e instanceof PDOException && (string) $e->getCode() === '42S02')) {
            error_log('[mediroad router] ' . $e->getMessage());
        }
    }
}
$auth = $user ? ($user['role'] === 'admin' ? 'admin' : 'member') : 'guest';

$method = request_method();
if ($method !== 'GET' && $method !== 'HEAD') {
    header('Allow: GET, HEAD');
    http_response_code(405);
    exit;
}

$uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$rawPath = parse_url($uri, PHP_URL_PATH);
if (!is_string($rawPath) || $rawPath === '') {
    $rawPath = '/';
}
$query = parse_url($uri, PHP_URL_QUERY);
$qs = (is_string($query) && $query !== '') ? '?' . $query : '';
$path = rawurldecode($rawPath);

// ---- 경로 조작·숨김 경로 차단 ----
if ($path[0] !== '/' || strpos($path, "\0") !== false || strpos($path, '\\') !== false || preg_match('#(^|/)\.#', $path)) {
    router_not_found($auth, $locOn);
}

// ---- 옛 주소 ----
$legacy = MR_LEGACY_REDIRECTS;
$trimmed = rtrim($path, '/');
if (isset($legacy[$trimmed])) {
    router_redirect($legacy[$trimmed] . $qs, 301);
}

// ---- .html 직접 접근 → 깔끔한 주소 ----
if (preg_match('#^(.*/)index\.html$#', $rawPath, $m)) {
    router_redirect($m[1] . $qs, 301);
}
if (substr($rawPath, -5) === '.html') {
    if ($rawPath === '/404.html') {
        router_not_found($auth, $locOn);
    }
    router_redirect(substr($rawPath, 0, -5) . '/' . $qs, 301);
}

// ---- 슬래시 없는 경로 → 슬래시 붙이기 (확장자 있는 없는 파일은 404) ----
if (substr($path, -1) !== '/') {
    if (strpos(basename($path), '.') === false) {
        router_redirect($rawPath . '/' . $qs, 301);
    }
    router_not_found($auth, $locOn);
}

// ---- 접근 제어 ----
$isLocation = strpos($path, '/location/') === 0;
$isAdmin = strpos($path, '/admin/') === 0;
$private = $isLocation || $isAdmin || in_array($path, array('/login/', '/signup/', '/forgot-password/', '/reset-password/'), true);

if ($isLocation) {
    if (!$locOn && $auth !== 'admin') {
        router_redirect('/');
    }
    if (!$user) {
        router_redirect('/login/?next=' . rawurlencode($rawPath . $qs));
    }
}
if ($isAdmin) {
    if (!$user) {
        router_redirect('/login/?next=' . rawurlencode($rawPath . $qs));
    }
    if ($auth !== 'admin') {
        router_redirect('/');
    }
}
if ($user && ($path === '/login/' || $path === '/signup/')) {
    router_redirect(mr_safe_next(isset($_GET['next']) ? $_GET['next'] : ''));
}

// ---- 정적 HTML ----
$root = realpath(MR_WEB_ROOT);
$file = realpath(MR_WEB_ROOT . $path . 'index.html');
if ($file === false || strpos($file, $root . DIRECTORY_SEPARATOR) !== 0 || !is_file($file)) {
    router_not_found($auth, $locOn);
}
router_render($file, 200, $auth, $locOn, $private);
