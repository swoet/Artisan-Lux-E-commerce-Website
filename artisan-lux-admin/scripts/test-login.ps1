$body = @{
    email = "auyamhirizhonga@gmail.com"
} | ConvertTo-Json

Write-Host ""
Write-Host "Testing Login API - Sending Verification Code" -ForegroundColor Cyan
Write-Host "Sending request to http://localhost:3001/api/public/login"
Write-Host "Email: auyamhirizhonga@gmail.com"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/public/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body

    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "SUCCESS! Check your email at: auyamhirizhonga@gmail.com" -ForegroundColor Green
    Write-Host "(Also check spam folder!)" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Error Response: $responseBody" -ForegroundColor Red
    }
}
