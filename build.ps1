# Builds cardmaker.html from src/cardmaker.src.html + design/Card2.svg + design/fonts/*.ttf
# Node-free equivalent of build.js. Run:  powershell -File build.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$src  = Join-Path $root 'src/cardmaker.src.html'
$svgF = Join-Path $root 'design/Card2.svg'
$fdir = Join-Path $root 'design/fonts'

function B64($p){ [Convert]::ToBase64String([IO.File]::ReadAllBytes($p)) }
function Face($fam,$wt,$file){
  $p = Join-Path $fdir $file
  "@font-face{font-family:'$fam';font-style:normal;font-weight:$wt;font-display:block;src:url(data:font/ttf;base64,$(B64 $p)) format('truetype');}"
}

# Font weight mapping.
# Figma's SVG export collapsed two FWC2026 widths into one family name + a weight:
#   normal-weight text  -> the wide "Normal Regular"   (Juan MUSSO, GOALKEEPER, MAFIA, abilities)
#   bold-weight text     -> the narrow "UltraCondensed" (the "FIFA WORLD CUP 2026" wordmark, KARTHAIN)
# So 'FWC2026' bold must point at the UltraCondensed files, NOT Normal Black, or those two
# layers render ~2x too wide vs the Figma/PNG design.
$faces = @(
  (Face 'FWC2026' 400 'FWC2026-NormalRegular.77c3c249.ttf'),
  (Face 'FWC2026' 700 'FWC2026-UltraCondensedBold.0e7149b5.ttf'),
  (Face 'FWC2026' 900 'FWC2026-UltraCondensedBlack.8e6ba053.ttf'),
  (Face 'FWC2026 Normal' 900 'FWC2026-NormalBlack.2bd896c8.ttf'),
  (Face 'FWC2026 Cond' 500 'FWC2026-UltraCondensedMedium.4da29b9d.ttf'),
  (Face 'FWC2026 Cond' 700 'FWC2026-UltraCondensedBold.0e7149b5.ttf'),
  (Face 'FWC2026 Cond' 900 'FWC2026-UltraCondensedBlack.8e6ba053.ttf')
) -join "`n"

# Read the SVG and inject the @font-face block as the first child of <svg> so both the
# live DOM and the serialized-for-export SVG carry the fonts.
$svg = [IO.File]::ReadAllText($svgF)
$svg = [regex]::Replace($svg, '(<svg\b[^>]*>)', "`$1`n<style>`n$faces`n</style>", 1)

$html = [IO.File]::ReadAllText($src)
$html = $html.Replace('<!--SVG_HERE-->', $svg)

$out = Join-Path $root 'cardmaker.html'
[IO.File]::WriteAllText($out, $html, [Text.UTF8Encoding]::new($false))
$kb = [math]::Round((Get-Item $out).Length/1KB)
Write-Output "built cardmaker.html  ${kb}kb"
