# PowerShell CORS Test Script
# This script tests CORS headers using PowerShell's Invoke-WebRequest

Write-Host "Starting CORS Tests with PowerShell" -ForegroundColor Green
Write-Host "=" * 50

# Test configuration
$baseUrl = "https://clothing-server-cyan.vercel.app"
$localUrl = "http://localhost:3000"

$allowedOrigins = @(
    "https://clothing-website-lovat.vercel.app",
    "https://clothing-dashboard-seven.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001"
)

$testEndpoints = @(
    "/api/products/published",
    "/api/auth/me",
    "/api/categories",
    "/api/brands"
)

# Function to test CORS
function Test-CorsHeaders {
    param(
        [string]$Url,
        [string]$Origin,
        [string]$Method = "OPTIONS"
    )
    
    try {
        Write-Host "`nTesting $Method $Url" -ForegroundColor Yellow
        Write-Host "   Origin: $Origin" -ForegroundColor Gray
        
        $headers = @{
            "Origin" = $Origin
            "Access-Control-Request-Method" = "GET"
            "Access-Control-Request-Headers" = "Content-Type,Authorization"
        }
        
        $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $headers -TimeoutSec 10
        
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
        Write-Host "   Headers:" -ForegroundColor Gray
        Write-Host "     Access-Control-Allow-Origin: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor White
        Write-Host "     Access-Control-Allow-Methods: $($response.Headers['Access-Control-Allow-Methods'])" -ForegroundColor White
        Write-Host "     Access-Control-Allow-Headers: $($response.Headers['Access-Control-Allow-Headers'])" -ForegroundColor White
        Write-Host "     Access-Control-Allow-Credentials: $($response.Headers['Access-Control-Allow-Credentials'])" -ForegroundColor White
        
        $isSuccess = $response.Headers['Access-Control-Allow-Origin'] -eq $Origin
        $status = if ($isSuccess) { "CORS working" } else { "CORS failed" }
        Write-Host "   Result: $status" -ForegroundColor $(if ($isSuccess) { "Green" } else { "Red" })
        
        return @{
            Success = $isSuccess
            StatusCode = $response.StatusCode
            Headers = $response.Headers
            Origin = $Origin
            Url = $Url
        }
    }
    catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{
            Success = $false
            Error = $_.Exception.Message
            Origin = $Origin
            Url = $Url
        }
    }
}

# Test unauthorized origin
function Test-UnauthorizedOrigin {
    param([string]$Url)
    return Test-CorsHeaders -Url $Url -Origin "https://malicious-site.com"
}

# Run tests for production server
Write-Host "`nTesting Production Server" -ForegroundColor Green
Write-Host "-" * 30

$productionResults = @()
foreach ($endpoint in $testEndpoints) {
    foreach ($origin in $allowedOrigins) {
        $result = Test-CorsHeaders -Url "$baseUrl$endpoint" -Origin $origin
        $productionResults += $result
        Start-Sleep -Milliseconds 500
    }
    
    # Test unauthorized origin
    $unauthorizedResult = Test-UnauthorizedOrigin -Url "$baseUrl$endpoint"
    $productionResults += $unauthorizedResult
}

# Run tests for local server
Write-Host "`nTesting Local Server" -ForegroundColor Green
Write-Host "-" * 30

$localResults = @()
foreach ($endpoint in $testEndpoints[0..1]) { # Test fewer endpoints for local
    foreach ($origin in $allowedOrigins[2..3]) { # Test localhost origins
        $result = Test-CorsHeaders -Url "$localUrl$endpoint" -Origin $origin
        $localResults += $result
        Start-Sleep -Milliseconds 500
    }
}

# Summary
Write-Host "`nTest Summary" -ForegroundColor Green
Write-Host "=" * 30

$productionSuccess = ($productionResults | Where-Object { $_.Success }).Count
$productionTotal = $productionResults.Count
$localSuccess = ($localResults | Where-Object { $_.Success }).Count
$localTotal = $localResults.Count

Write-Host "Production Server: $productionSuccess/$productionTotal tests passed" -ForegroundColor Cyan
Write-Host "Local Server: $localSuccess/$localTotal tests passed" -ForegroundColor Cyan

# Detailed analysis
Write-Host "`nDetailed Analysis" -ForegroundColor Green
Write-Host "-" * 20

$productionRate = [math]::Round(($productionSuccess / $productionTotal) * 100, 1)
$localRate = [math]::Round(($localSuccess / $localTotal) * 100, 1)

Write-Host "Production Success Rate: $productionRate%" -ForegroundColor Cyan
Write-Host "Local Success Rate: $localRate%" -ForegroundColor Cyan

# Recommendations
Write-Host "`nRecommendations" -ForegroundColor Green
Write-Host "-" * 15

if ($productionRate -lt 80) {
    Write-Host "Production CORS needs attention - check server configuration" -ForegroundColor Red
} else {
    Write-Host "Production CORS is working well" -ForegroundColor Green
}

if ($localRate -lt 80) {
    Write-Host "Local CORS needs attention - ensure server is running" -ForegroundColor Red
} else {
    Write-Host "Local CORS is working well" -ForegroundColor Green
}

Write-Host "`nTest completed!" -ForegroundColor Green
