<?php
// db.php - ConfiguraciÃ³n Oficial y ConexiÃ³n Resiliente para WebHost Chile
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

// Perfiles de conexiÃ³n a intentar automÃ¡ticamente en orden
$connection_configs = [
    // 1. ProducciÃ³n cPanel WebHost Chile (Host: localhost, Usuario: laromana_ronin, Clave: Ronin.abc.123)
    [
        'host' => 'localhost',
        'db'   => 'laromana_basededatos',
        'user' => 'laromana_ronin',
        'pass' => 'Ronin.abc.123'
    ],
    // 2. ProducciÃ³n vÃ­a TCP 127.0.0.1
    [
        'host' => '127.0.0.1',
        'db'   => 'laromana_basededatos',
        'user' => 'laromana_ronin',
        'pass' => 'Ronin.abc.123'
    ],
    // 3. ProducciÃ³n con variante de clave rONIN.ABC.123
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
    ],
    // 4. Local XAMPP
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
    ]
];

$pdo = null;
$last_error = null;

foreach ($connection_configs as $cfg) {
    try {
        $dsn = "mysql:host={$cfg['host']};dbname={$cfg['db']};charset=utf8mb4";
        $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], $options);
        if ($pdo) {
            break;
        }
    } catch (\PDOException $e) {
        $last_error = $e->getMessage();
    }
}

if (!$pdo) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexiÃ³n a la base de datos de WebHost Chile: " . $last_error]);
    exit();
}
?>
