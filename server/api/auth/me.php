<?php
/** 현재 로그인 회원 */
require __DIR__ . '/../../app/api.php';
require_method('GET');

$u = current_user();
json_ok(array('user' => $u ? user_public($u) : null));
