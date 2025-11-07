
Param(
  [Parameter(Mandatory=$true)] [string]$Src,
  [Parameter(Mandatory=$false)] [string]$Out = ".\catalog.json",
  [Parameter(Mandatory=$false)] [string]$Copy
)

# Regex del nombre de archivo
$NameRe = '^(?<brand>[A-Za-z]+)_(?<genero>Hombre|Mujer|Unisex)_(?<modelo>[^_]+)_(?<color>[^_]+)_(?<precio>\d+(?:\.\d+)?)_(?<tallas>(?:\d+(?:\.\d+)?)(?:-\d+(?:\.\d+)?)*)\.(?<ext>jpg|jpeg|png|webp|gif)$'
$ValidExt = @('jpg','jpeg','png','webp','gif')

function Ensure-Dir($Path){
  if (-not (Test-Path -LiteralPath $Path)) { New-Item -ItemType Directory -Force -Path $Path | Out-Null }
}

# Normaliza separadores a '/' para usar en JSON/web
function To-RelWebPath([string]$FromPath, [string]$ToPath){
  $fromDir = Split-Path -Parent (Resolve-Path -LiteralPath $FromPath)
  $toFull  = Resolve-Path -LiteralPath $ToPath
  $uriFrom = New-Object System.Uri($fromDir + [IO.Path]::DirectorySeparatorChar)
  $uriTo   = New-Object System.Uri($toFull)
  $rel = $uriFrom.MakeRelativeUri($uriTo).ToString()
  # Reemplaza %20 y similares (decode)
  $rel = [System.Uri]::UnescapeDataString($rel)
  return $rel -replace '\\','/'
}

$items = @()
$added = 0; $skipped = 0

$files = Get-ChildItem -LiteralPath $Src -Recurse -File -ErrorAction Stop
foreach($f in $files){
  $ext = $f.Extension.TrimStart('.').ToLower()
  if (-not $ValidExt.Contains($ext)) { $skipped++; continue }

  $m = [regex]::Match($f.Name, $NameRe, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if (-not $m.Success) { $skipped++; continue }

  $brand  = $m.Groups['brand'].Value
  $genero = $m.Groups['genero'].Value
  $modelo = $m.Groups['modelo'].Value
  $color  = $m.Groups['color'].Value
  $precio = [double]$m.Groups['precio'].Value
  $tallas = $m.Groups['tallas'].Value.Split('-')

  $destPath = $null
  if ($Copy){
    $brandDir = Join-Path -Path $Copy -ChildPath $brand
    Ensure-Dir $brandDir
    $destPath = Join-Path -Path $brandDir -ChildPath $f.Name
    Copy-Item -LiteralPath $f.FullName -Destination $destPath -Force
  } else {
    $destPath = $f.FullName
  }

  $rel = To-RelWebPath $Out $destPath

  $item = [ordered]@{
    brand  = $brand
    genero = $genero
    modelo = $modelo
    color  = $color
    precio = $precio
    tallas = $tallas
    image  = $rel
  }
  $items += $item
  $added++
}

$data = [ordered]@{
  generatedAt = (Get-Date).ToUniversalTime().ToString("o")
  items = $items
}

Ensure-Dir (Split-Path -Parent (Resolve-Path -LiteralPath (Split-Path -Leaf -Path $Out) -ErrorAction SilentlyContinue) )

# Escribe JSON bonito con profundidad suficiente
$data | ConvertTo-Json -Depth 6 | Out-File -FilePath $Out -Encoding UTF8 -Force

Write-Host "✅ Catálogo generado: $Out"
Write-Host "   $added válidos, $skipped ignorados."
if ($Copy) { Write-Host "📁 Imágenes copiadas a: $Copy" }
