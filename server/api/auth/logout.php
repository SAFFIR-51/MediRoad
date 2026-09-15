<?php
/** 로그아웃 */
require __DIR__ . '/../../app/api.php';
require_post();

logout_user();
json_ok();
