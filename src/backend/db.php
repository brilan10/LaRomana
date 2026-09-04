<?php
// db.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$is_local = (isset($_SERVER['HTTP_HOST']) && (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false)) || (php_sapi_name() === 'cli');

if ($is_local) {
    $connection_configs = [
        [
            'host' => '127.0.0.1',
            'db'   => 'la_romana',
            'user' => 'root',
            'pass' => ''
        ],
        [
            'host' => 'localhost',
            'db'   => 'la_romana',
            'user' => 'root',
            'pass' => ''
        ],
        [
            'host' => 'localhost',
            'db'   => 'laromana_basededatos',
            'user' => 'laromana_ronin',
            'pass' => 'Ronin.abc.123'
        ],
        [
            'host' => '127.0.0.1',
            'db'   => 'laromana_basededatos',
            'user' => 'laromana_ronin',
            'pass' => 'Ronin.abc.123'
        ]
    ];
} else {
    $connection_configs = [
        [
            'host' => 'localhost',
            'db'   => 'laromana_basededatos',
            'user' => 'laromana_ronin',
            'pass' => 'Ronin.abc.123'
        ],
        [
            'host' => '127.0.0.1',
            'db'   => 'laromana_basededatos',
            'user' => 'laromana_ronin',
            'pass' => 'Ronin.abc.123'
        ],
        [
            'host' => 'localhost',
            'db'   => 'laromana_basededatos',
            'user' => 'laromana_ronin',
            'pass' => 'rONIN.ABC.123'
        ],
        [
            'host' => '127.0.0.1',
            'db'   => 'laromana_basededatos',
            'user' => 'laromana_ronin',
            'pass' => 'rONIN.ABC.123'
        ]
    ];
}

$pdo = null;
$last_error = null;

foreach ($connection_configs as $cfg) {
    try {
        $dsn = "mysql:host={$cfg['host']};dbname={$cfg['db']};charset=utf8mb4";
        $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], $options);
        if ($pdo) {
            break; // ¡Conexión exitosa!
        }
    } catch (\PDOException $e) {
        $last_error = $e->getMessage();
    }
}

if (!$pdo) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos: " . $last_error]);
    exit();
}
?>
