<?php
/**
 * JSON API 공통 진입. api/*.php 맨 위에서 require 한다.
 * 처리되지 않은 예외는 로그에만 남기고 사용자에게는 일반 오류 메시지를 준다.
 */
require_once __DIR__ . '/bootstrap.php';

header('X-Content-Type-Options: nosniff');

set_exception_handler(function ($e) {
    error_log('[mediroad api] ' . get_class($e) . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    if (!headers_sent()) {
        json_error('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 500);
    }
    exit;
});

if (!mr_config()) {
    json_error('설정 파일 없음: app/config.php 를 만들어 주세요.', 500);
}

// 요청 50번에 한 번꼴로 오래된 로그인 시도·비밀번호 재설정 기록을 지운다 (cron 없는 카페24 웹호스팅용)
if (mt_rand(1, 50) === 1) {
    try {
        purge_security_logs();
    } catch (Exception $e) {
        error_log('[mediroad purge] ' . $e->getMessage());
    }
}
