# Petit serveur statique local pour prévisualiser le site (http://localhost:8090)
param([int]$Port = 8090)
$racine = Split-Path -Parent $PSScriptRoot
$types = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="text/javascript; charset=utf-8";
  ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".svg"="image/svg+xml"; ".ico"="image/x-icon"; ".webp"="image/webp" }
$ecoute = New-Object System.Net.HttpListener
$ecoute.Prefixes.Add("http://localhost:$Port/")
$ecoute.Start()
Write-Host "Site servi sur http://localhost:$Port/"
while ($ecoute.IsListening) {
  $ctx = $ecoute.GetContext()
  $chemin = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
  if ($chemin -eq "" -or $chemin.EndsWith("/")) { $chemin += "index.html" }
  $fichier = [IO.Path]::GetFullPath((Join-Path $racine $chemin))
  if ($fichier.StartsWith($racine) -and (Test-Path $fichier -PathType Leaf)) {
    $octets = [IO.File]::ReadAllBytes($fichier)
    $ext = [IO.Path]::GetExtension($fichier).ToLower()
    $ctx.Response.ContentType = if ($types[$ext]) { $types[$ext] } else { "application/octet-stream" }
    $ctx.Response.Headers.Add("Cache-Control", "no-store")
    $ctx.Response.OutputStream.Write($octets, 0, $octets.Length)
  } else {
    $ctx.Response.StatusCode = 404
  }
  Write-Host "$($ctx.Response.StatusCode) /$chemin"
  $ctx.Response.Close()
}
