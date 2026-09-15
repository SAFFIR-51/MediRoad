<?php
/** PDO MySQL(MariaDB) 연결과 쿼리 헬퍼. 모든 값은 prepared statement 로만 넘긴다. */

function db()
{
    static $pdo = null;
    if ($pdo) {
        return $pdo;
    }
    $d = mr_cfg('db');
    if (!is_array($d)) {
        throw new RuntimeException('DB 설정이 없습니다.');
    }
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        isset($d['host']) ? $d['host'] : 'localhost',
        isset($d['port']) ? $d['port'] : '3306',
        isset($d['name']) ? $d['name'] : ''
    );
    $pdo = new PDO($dsn, isset($d['user']) ? $d['user'] : '', isset($d['pass']) ? $d['pass'] : '', array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ));
    $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("SET time_zone = '+09:00'");
    return $pdo;
}

function db_query($sql, array $params = array())
{
    $st = db()->prepare($sql);
    $st->execute(array_values($params));
    return $st;
}

function db_one($sql, array $params = array())
{
    $row = db_query($sql, $params)->fetch();
    return $row === false ? null : $row;
}

function db_all($sql, array $params = array())
{
    return db_query($sql, $params)->fetchAll();
}

/** 영향받은 행 수 */
function db_exec($sql, array $params = array())
{
    return db_query($sql, $params)->rowCount();
}

function db_count($sql, array $params = array())
{
    $row = db_query($sql, $params)->fetch(PDO::FETCH_NUM);
    return $row ? (int) $row[0] : 0;
}

function db_is_duplicate(PDOException $e)
{
    return (string) $e->getCode() === '23000';
}
