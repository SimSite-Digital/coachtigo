<?php
/**
 * Coach'tigo — endpoint de formulário (lógica Rio Bravo / padrão SimSite)
 * Recebe o POST do formulário, valida, envia e-mail para a equipe,
 * grava um log local e devolve JSON para o front (main.js abre o WhatsApp
 * com a mensagem pré-preenchida após o sucesso).
 *
 * CONFIRMAR: endpoint de e-mail (mail()) depende de configuração SMTP do
 * servidor de produção — validar com a hospedagem antes de publicar.
 * Nenhuma integração de e-mail marketing foi conectada aqui (decisão do
 * cliente: newsletter só captura e grava, sem ferramenta externa por ora).
 */

header('Content-Type: application/json; charset=utf-8');

$DESTINATARIO = 'contato@coachtigo.com.br';
$LOG_FILE = __DIR__ . '/../data/leads.log';

function responder($ok, $mensagem) {
    http_response_code($ok ? 200 : 400);
    echo json_encode(['ok' => $ok, 'mensagem' => $mensagem]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método não permitido.');
}

function campo($nome, $obrigatorio = false) {
    $valor = isset($_POST[$nome]) ? trim(strip_tags($_POST[$nome])) : '';
    if ($obrigatorio && $valor === '') {
        responder(false, "Campo obrigatório ausente: {$nome}");
    }
    return $valor;
}

$tipo      = campo('tipo', true);
$nome      = campo('nome');
$empresa   = campo('empresa');
$email     = campo('email', true);
$telefone  = campo('telefone');
$assunto   = campo('assunto');
$mensagem  = campo('mensagem');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'E-mail inválido.');
}

// Grava lead em log local (fallback caso o e-mail falhe no servidor)
$linha = sprintf(
    "[%s] tipo=%s nome=%s empresa=%s email=%s telefone=%s assunto=%s mensagem=%s\n",
    date('Y-m-d H:i:s'),
    $tipo, $nome, $empresa, $email, $telefone, $assunto, str_replace(["\r", "\n"], ' ', $mensagem)
);
@file_put_contents($LOG_FILE, $linha, FILE_APPEND | LOCK_EX);

// Monta e envia e-mail para a equipe
$assuntoEmail = '[Site Coach\'tigo] Novo contato — ' . ($assunto ?: $tipo);
$corpo = "Tipo: {$tipo}\n";
if ($nome)     $corpo .= "Nome: {$nome}\n";
if ($empresa)  $corpo .= "Empresa: {$empresa}\n";
$corpo .= "E-mail: {$email}\n";
if ($telefone) $corpo .= "Telefone: {$telefone}\n";
if ($assunto)  $corpo .= "Assunto: {$assunto}\n";
if ($mensagem) $corpo .= "Mensagem:\n{$mensagem}\n";

$headers = "From: site@coachtigo.com.br\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";

$enviado = @mail($DESTINATARIO, $assuntoEmail, $corpo, $headers);

// Mesmo se o mail() falhar (comum em ambiente de desenvolvimento local),
// o lead já está registrado no log — não bloqueia a experiência do usuário.
responder(true, 'Recebido com sucesso.');
