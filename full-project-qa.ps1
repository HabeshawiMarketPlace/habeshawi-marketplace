param(
  [string]$ProjectRoot = (Get-Location).Path,
  [switch]$RunBuild,
  [switch]$RunLint
)

$ErrorActionPreference = "Continue"

$excludedDirectories = @(
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  "coverage",
  "dist",
  "build"
)

$reportPath = Join-Path $ProjectRoot "full-qa-report.txt"

function Write-Section {
  param([string]$Title)

  $line = "=" * 88
  Add-Content -Path $reportPath -Value ""
  Add-Content -Path $reportPath -Value $line
  Add-Content -Path $reportPath -Value $Title
  Add-Content -Path $reportPath -Value $line
}

function Write-Result {
  param(
    [string]$Status,
    [string]$Message
  )

  $output = "[$Status] $Message"
  Write-Host $output
  Add-Content -Path $reportPath -Value $output
}

function Is-ExcludedPath {
  param([string]$FullName)

  foreach ($directory in $excludedDirectories) {
    $pattern = [regex]::Escape(
      [System.IO.Path]::DirectorySeparatorChar + $directory +
      [System.IO.Path]::DirectorySeparatorChar
    )

    if ($FullName -match $pattern) {
      return $true
    }
  }

  return $false
}

function Get-SourceFiles {
  param([string[]]$Extensions)

  Get-ChildItem -Path $ProjectRoot -Recurse -File |
    Where-Object {
      -not (Is-ExcludedPath $_.FullName) -and
      $Extensions -contains $_.Extension.ToLowerInvariant()
    }
}

function Get-AppRoute {
  param([string]$PagePath)

  $appRoot = Join-Path $ProjectRoot "app"
  $relative = $PagePath.Substring($appRoot.Length).TrimStart("\", "/")
  $directory = Split-Path $relative -Parent

  if ([string]::IsNullOrWhiteSpace($directory) -or $directory -eq ".") {
    return "/"
  }

  $segments = $directory -split "[\\/]" |
    Where-Object {
      $_ -and
      -not $_.StartsWith("(") -and
      -not $_.StartsWith("@")
    }

  if ($segments.Count -eq 0) {
    return "/"
  }

  return "/" + ($segments -join "/")
}

function Route-Matches {
  param(
    [string]$Link,
    [string]$Route
  )

  $cleanLink = ($Link -split "[?#]")[0]

  if ($cleanLink -eq $Route) {
    return $true
  }

  $routeSegments = $Route.Trim("/") -split "/"
  $linkSegments = $cleanLink.Trim("/") -split "/"

  if ($routeSegments.Count -ne $linkSegments.Count) {
    return $false
  }

  for ($i = 0; $i -lt $routeSegments.Count; $i++) {
    $routeSegment = $routeSegments[$i]
    $linkSegment = $linkSegments[$i]

    if ($routeSegment -match "^\[\.\.\..+\]$") {
      return $true
    }

    if ($routeSegment -match "^\[\[.+\]\]$") {
      continue
    }

    if ($routeSegment -match "^\[.+\]$") {
      continue
    }

    if ($routeSegment -ne $linkSegment) {
      return $false
    }
  }

  return $true
}

Set-Content -Path $reportPath -Value "Habeshawi Marketplace - Full QA Report"
Add-Content -Path $reportPath -Value ("Generated: " + (Get-Date))
Add-Content -Path $reportPath -Value ("Project: " + $ProjectRoot)

Write-Host ""
Write-Host "Running full project QA..."
Write-Host "Project: $ProjectRoot"
Write-Host ""

$sourceFiles = Get-SourceFiles @(
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".scss",
  ".md"
)

$tsxFiles = Get-SourceFiles @(".tsx", ".ts", ".jsx", ".js")

Write-Section "1. PROJECT STRUCTURE"

$requiredItems = @(
  "app",
  "components",
  "package.json",
  "next.config.ts"
)

foreach ($item in $requiredItems) {
  $path = Join-Path $ProjectRoot $item

  if (Test-Path $path) {
    Write-Result "PASS" "$item exists."
  }
  elseif ($item -eq "next.config.ts" -and
    ((Test-Path (Join-Path $ProjectRoot "next.config.js")) -or
     (Test-Path (Join-Path $ProjectRoot "next.config.mjs")))) {
    Write-Result "PASS" "A Next.js configuration file exists."
  }
  else {
    Write-Result "WARN" "$item was not found."
  }
}

Write-Section "2. DUPLICATE FILE NAMES"

$duplicateNames = $sourceFiles |
  Group-Object { $_.Name.ToLowerInvariant() } |
  Where-Object { $_.Count -gt 1 } |
  Sort-Object Count -Descending

if ($duplicateNames.Count -eq 0) {
  Write-Result "PASS" "No duplicate source file names found."
}
else {
  foreach ($group in $duplicateNames) {
    Write-Result "REVIEW" "Duplicate filename: $($group.Name) ($($group.Count) files)"
    foreach ($file in $group.Group) {
      Add-Content -Path $reportPath -Value ("    " + $file.FullName)
    }
  }
}

Write-Section "3. EXACT DUPLICATE FILE CONTENT"

$hashGroups = foreach ($file in $sourceFiles) {
  try {
    $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash

    [PSCustomObject]@{
      Hash = $hash
      File = $file.FullName
      Size = $file.Length
    }
  }
  catch {
    Write-Result "WARN" "Could not hash $($file.FullName): $($_.Exception.Message)"
  }
}

$exactDuplicates = $hashGroups |
  Where-Object { $_.Size -gt 0 } |
  Group-Object Hash |
  Where-Object { $_.Count -gt 1 }

if ($exactDuplicates.Count -eq 0) {
  Write-Result "PASS" "No exact duplicate source files found."
}
else {
  foreach ($group in $exactDuplicates) {
    Write-Result "REVIEW" "Files with identical content:"
    foreach ($item in $group.Group) {
      Add-Content -Path $reportPath -Value ("    " + $item.File)
    }
  }
}

Write-Section "4. APP ROUTES AND COLLISIONS"

$appPath = Join-Path $ProjectRoot "app"

if (-not (Test-Path $appPath)) {
  Write-Result "FAIL" "The app directory does not exist."
}
else {
  $pageFiles = Get-ChildItem -Path $appPath -Recurse -Filter "page.*" -File |
    Where-Object {
      $_.Extension -in @(".tsx", ".ts", ".jsx", ".js")
    }

  $routeObjects = foreach ($page in $pageFiles) {
    [PSCustomObject]@{
      Route = Get-AppRoute $page.FullName
      RouteLower = (Get-AppRoute $page.FullName).ToLowerInvariant()
      File = $page.FullName
    }
  }

  foreach ($route in ($routeObjects | Sort-Object Route)) {
    Add-Content -Path $reportPath -Value (
      "{0,-45} {1}" -f $route.Route, $route.File
    )
  }

  $routeCollisions = $routeObjects |
    Group-Object RouteLower |
    Where-Object { $_.Count -gt 1 }

  if ($routeCollisions.Count -eq 0) {
    Write-Result "PASS" "No exact or case-insensitive route collisions found."
  }
  else {
    foreach ($group in $routeCollisions) {
      Write-Result "FAIL" "Route collision: $($group.Name)"
      foreach ($item in $group.Group) {
        Add-Content -Path $reportPath -Value ("    " + $item.File)
      }
    }
  }
}

Write-Section "5. POTENTIAL OVERLAPPING ROUTES"

if ($routeObjects) {
  $routeLeafGroups = $routeObjects |
    Where-Object { $_.Route -ne "/" } |
    Group-Object {
      ($_.Route.Trim("/") -split "/")[-1].ToLowerInvariant()
    } |
    Where-Object { $_.Count -gt 1 } |
    Sort-Object Name

  if ($routeLeafGroups.Count -eq 0) {
    Write-Result "PASS" "No repeated route leaf names found."
  }
  else {
    foreach ($group in $routeLeafGroups) {
      Write-Result "REVIEW" "Repeated route name '$($group.Name)':"
      foreach ($item in $group.Group) {
        Add-Content -Path $reportPath -Value ("    " + $item.Route)
      }
    }
  }
}

Write-Section "6. HEADER AND FOOTER RENDERING"

$headerMatches = $tsxFiles |
  Select-String -Pattern "<Header(?:\s|/|>)" -AllMatches

$footerMatches = $tsxFiles |
  Select-String -Pattern "<Footer(?:\s|/|>)" -AllMatches

Write-Result "INFO" "Header render occurrences: $($headerMatches.Count)"
foreach ($match in $headerMatches) {
  Add-Content -Path $reportPath -Value (
    "    $($match.Path):$($match.LineNumber) $($match.Line.Trim())"
  )
}

Write-Result "INFO" "Footer render occurrences: $($footerMatches.Count)"
foreach ($match in $footerMatches) {
  Add-Content -Path $reportPath -Value (
    "    $($match.Path):$($match.LineNumber) $($match.Line.Trim())"
  )
}

if ($headerMatches.Count -le 1) {
  Write-Result "PASS" "Header is not obviously rendered more than once."
}
else {
  Write-Result "REVIEW" "Header is rendered in multiple files. Verify this is intentional."
}

if ($footerMatches.Count -le 1) {
  Write-Result "PASS" "Footer is not obviously rendered more than once."
}
else {
  Write-Result "REVIEW" "Footer is rendered in multiple files. Verify this is intentional."
}

Write-Section "7. LEGACY OR BROKEN SIGN-IN ROUTES"

$signinMatches = $tsxFiles |
  Select-String -Pattern '["'']\/signin(?:["''/?#])' -AllMatches

if ($signinMatches.Count -eq 0) {
  Write-Result "PASS" "No /signin references found."
}
else {
  foreach ($match in $signinMatches) {
    Write-Result "FAIL" "/signin reference: $($match.Path):$($match.LineNumber)"
    Add-Content -Path $reportPath -Value ("    " + $match.Line.Trim())
  }
}

Write-Section "8. INTERNAL LINK VALIDATION"

$internalLinks = New-Object System.Collections.Generic.List[object]

foreach ($file in $tsxFiles) {
  $content = Get-Content -Path $file.FullName -Raw

  $patterns = @(
    'href\s*=\s*["''](\/[^"'']*)["'']',
    'router\.(?:push|replace)\(\s*["''](\/[^"'']*)["'']\s*\)'
  )

  foreach ($pattern in $patterns) {
    foreach ($match in [regex]::Matches($content, $pattern)) {
      $internalLinks.Add(
        [PSCustomObject]@{
          Link = $match.Groups[1].Value
          File = $file.FullName
        }
      )
    }
  }
}

$uniqueLinks = $internalLinks |
  Group-Object Link |
  ForEach-Object { $_.Group[0] } |
  Sort-Object Link

$ignoredPrefixes = @(
  "/api/",
  "/_next/",
  "/auth/"
)

$brokenLinks = @()

foreach ($linkItem in $uniqueLinks) {
  $link = ($linkItem.Link -split "[?#]")[0]

  if ($link -eq "" -or $link -eq "/") {
    continue
  }

  $ignored = $false

  foreach ($prefix in $ignoredPrefixes) {
    if ($link.StartsWith($prefix)) {
      $ignored = $true
      break
    }
  }

  if ($ignored) {
    continue
  }

  $matched = $false

  foreach ($route in $routeObjects) {
    if (Route-Matches -Link $link -Route $route.Route) {
      $matched = $true
      break
    }
  }

  if (-not $matched) {
    $brokenLinks += $linkItem
  }
}

if ($brokenLinks.Count -eq 0) {
  Write-Result "PASS" "No obvious broken static internal links found."
}
else {
  foreach ($item in $brokenLinks) {
    Write-Result "REVIEW" "Possible broken link '$($item.Link)' in $($item.File)"
  }
}

Write-Section "9. DUPLICATE STATIC LINKS INSIDE THE SAME FILE"

$duplicateLinksFound = $false

foreach ($file in $tsxFiles) {
  $content = Get-Content -Path $file.FullName -Raw
  $matches = [regex]::Matches(
    $content,
    'href\s*=\s*["''](\/[^"'']*)["'']'
  )

  $groups = $matches |
    ForEach-Object { $_.Groups[1].Value } |
    Group-Object |
    Where-Object { $_.Count -gt 1 }

  foreach ($group in $groups) {
    $duplicateLinksFound = $true
    Write-Result "REVIEW" (
      "Repeated link '$($group.Name)' appears $($group.Count) times in $($file.FullName)"
    )
  }
}

if (-not $duplicateLinksFound) {
  Write-Result "PASS" "No repeated static href values found within individual files."
}

Write-Section "10. COMPONENT IMPORT VALIDATION"

$missingImports = @()

foreach ($file in $tsxFiles) {
  $content = Get-Content -Path $file.FullName -Raw

  $matches = [regex]::Matches(
    $content,
    'from\s+["'']@\/(components\/[^"'']+)["'']'
  )

  foreach ($match in $matches) {
    $relativeImport = $match.Groups[1].Value
    $basePath = Join-Path $ProjectRoot $relativeImport

    $candidatePaths = @(
      $basePath,
      "$basePath.tsx",
      "$basePath.ts",
      "$basePath.jsx",
      "$basePath.js",
      (Join-Path $basePath "index.tsx"),
      (Join-Path $basePath "index.ts"),
      (Join-Path $basePath "index.jsx"),
      (Join-Path $basePath "index.js")
    )

    $exists = $candidatePaths |
      Where-Object { Test-Path $_ } |
      Select-Object -First 1

    if (-not $exists) {
      $missingImports += [PSCustomObject]@{
        Import = "@/$relativeImport"
        File = $file.FullName
      }
    }
  }
}

if ($missingImports.Count -eq 0) {
  Write-Result "PASS" "All checked @/components imports resolve to files."
}
else {
  foreach ($item in $missingImports) {
    Write-Result "FAIL" "Missing import $($item.Import) in $($item.File)"
  }
}

Write-Section "11. DEBUGGING AND UNFINISHED CODE"

$qualityPatterns = @{
  "console.log" = "\bconsole\.log\s*\("
  "debugger" = "\bdebugger\b"
  "TODO" = "\bTODO\b"
  "FIXME" = "\bFIXME\b"
  "placeholder alert" = 'alert\(\s*["''](?:test|todo|placeholder)'
}

foreach ($label in $qualityPatterns.Keys) {
  $matches = $tsxFiles |
    Select-String -Pattern $qualityPatterns[$label] -AllMatches

  if ($matches.Count -eq 0) {
    Write-Result "PASS" "No $label occurrences found."
  }
  else {
    Write-Result "REVIEW" "$label occurrences: $($matches.Count)"
    foreach ($match in $matches) {
      Add-Content -Path $reportPath -Value (
        "    $($match.Path):$($match.LineNumber) $($match.Line.Trim())"
      )
    }
  }
}

Write-Section "12. ENVIRONMENT VARIABLE REFERENCES"

$envMatches = $tsxFiles |
  Select-String -Pattern 'process\.env\.([A-Z0-9_]+)' -AllMatches

$envNames = foreach ($match in $envMatches) {
  foreach ($regexMatch in $match.Matches) {
    $regexMatch.Groups[1].Value
  }
}

$envNames = $envNames | Sort-Object -Unique

if ($envNames.Count -eq 0) {
  Write-Result "INFO" "No process.env references found in checked source files."
}
else {
  foreach ($name in $envNames) {
    Add-Content -Path $reportPath -Value ("    " + $name)
  }

  $envFiles = @(
    ".env.local",
    ".env",
    ".env.production",
    ".env.development"
  ) |
    ForEach-Object { Join-Path $ProjectRoot $_ } |
    Where-Object { Test-Path $_ }

  foreach ($name in $envNames) {
    $found = $false

    foreach ($envFile in $envFiles) {
      if (Select-String -Path $envFile -Pattern "^\s*$([regex]::Escape($name))\s*=" -Quiet) {
        $found = $true
        break
      }
    }

    if ($found) {
      Write-Result "PASS" "$name is defined in a local environment file."
    }
    else {
      Write-Result "REVIEW" "$name was not found in local environment files. It may be set in Vercel."
    }
  }
}

Write-Section "13. PACKAGE SCRIPTS"

$packagePath = Join-Path $ProjectRoot "package.json"

if (Test-Path $packagePath) {
  try {
    $package = Get-Content -Path $packagePath -Raw | ConvertFrom-Json

    foreach ($scriptName in @("dev", "build", "lint", "start")) {
      if ($package.scripts.$scriptName) {
        Write-Result "PASS" "npm script '$scriptName' exists."
      }
      else {
        Write-Result "WARN" "npm script '$scriptName' is missing."
      }
    }
  }
  catch {
    Write-Result "FAIL" "package.json could not be parsed."
  }
}
else {
  Write-Result "FAIL" "package.json was not found."
}

if ($RunLint) {
  Write-Section "14. LINT RESULTS"

  Push-Location $ProjectRoot
  try {
    & npm run lint 2>&1 |
      Tee-Object -FilePath $reportPath -Append

    if ($LASTEXITCODE -eq 0) {
      Write-Result "PASS" "Lint completed successfully."
    }
    else {
      Write-Result "FAIL" "Lint returned exit code $LASTEXITCODE."
    }
  }
  finally {
    Pop-Location
  }
}

if ($RunBuild) {
  Write-Section "15. PRODUCTION BUILD RESULTS"

  Push-Location $ProjectRoot
  try {
    & npm run build 2>&1 |
      Tee-Object -FilePath $reportPath -Append

    if ($LASTEXITCODE -eq 0) {
      Write-Result "PASS" "Production build completed successfully."
    }
    else {
      Write-Result "FAIL" "Production build returned exit code $LASTEXITCODE."
    }
  }
  finally {
    Pop-Location
  }
}

Write-Section "FINAL SUMMARY"
Write-Result "DONE" "QA scan complete."
Write-Result "INFO" "Full report saved to: $reportPath"

Write-Host ""
Write-Host "Open the report with:"
Write-Host "notepad `"$reportPath`""
