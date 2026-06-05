<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ReportService;
use App\Support\Request;
use App\Support\Response;
use FPDF;
use RuntimeException;
use ZipArchive;

final class ReportController
{
    public function summary(Request $request): void
    {
        $service = new ReportService(
            getenv('ITEM_SERVICE_URL') ?: 'http://localhost:3002',
            getenv('SUPPLIER_SERVICE_URL') ?: 'http://localhost:3003',
            getenv('STOCK_SERVICE_URL') ?: 'http://localhost:3004',
        );

        try {
            $data = $service->summary($request->authorization());
        } catch (RuntimeException $exception) {
            Response::json(['error' => $exception->getMessage()], 502);
            return;
        }

        match (strtolower($request->query('format', 'json'))) {
            'json' => Response::json($data),
            'pdf' => $this->pdf($data),
            'xlsx', 'excel' => $this->xlsx($data),
            default => Response::json(['error' => 'format must be json, pdf, or xlsx'], 400),
        };
    }

    private function pdf(array $data): void
    {
        $pdf = new FPDF();
        $pdf->AddPage();
        $pdf->SetFont('Arial', 'B', 16);
        $pdf->Cell(0, 10, 'Inventory Summary', 0, 1);
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(0, 8, 'Generated at: ' . $data['generated_at'], 0, 1);
        $pdf->Ln(4);

        foreach ($data['totals'] as $label => $value) {
            $pdf->Cell(60, 8, ucwords(str_replace('_', ' ', $label)), 1);
            $pdf->Cell(30, 8, (string) $value, 1, 1);
        }

        $pdf->Ln(8);
        $pdf->SetFont('Arial', 'B', 11);
        foreach (['SKU', 'Item', 'Qty', 'Min', 'Status'] as $heading) {
            $pdf->Cell($heading === 'Item' ? 65 : 30, 8, $heading, 1);
        }
        $pdf->Ln();
        $pdf->SetFont('Arial', '', 10);
        foreach ($data['stocks'] as $row) {
            $pdf->Cell(30, 8, substr((string) $row['sku'], 0, 14), 1);
            $pdf->Cell(65, 8, substr((string) $row['item_name'], 0, 32), 1);
            $pdf->Cell(30, 8, (string) $row['quantity'], 1);
            $pdf->Cell(30, 8, (string) $row['min_quantity'], 1);
            $pdf->Cell(30, 8, (string) $row['status'], 1, 1);
        }

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="inventory-summary.pdf"');
        echo $pdf->Output('S');
    }

    private function xlsx(array $data): void
    {
        $sheets = [
            'Summary' => [
                ['Metric', 'Value'],
                ['Generated At', $data['generated_at']],
                ['Items', $data['totals']['items']],
                ['Suppliers', $data['totals']['suppliers']],
                ['Stock Records', $data['totals']['stock_records']],
                ['Low Stock', $data['totals']['low_stock']],
            ],
            'Stocks' => array_merge(
                [['Item ID', 'SKU', 'Item Name', 'Location', 'Quantity', 'Minimum Quantity', 'Status']],
                array_map(static fn (array $row): array => [
                    $row['item_id'],
                    $row['sku'],
                    $row['item_name'],
                    $row['location'],
                    $row['quantity'],
                    $row['min_quantity'],
                    $row['status'],
                ], $data['stocks'])
            ),
            'Suppliers' => array_merge(
                [['ID', 'Name', 'Primary Contact', 'Phone', 'Email', 'Address']],
                array_map(static fn (array $row): array => [
                    $row['id'] ?? '',
                    $row['name'] ?? '',
                    $row['primary_contact']['contact_name'] ?? '',
                    $row['primary_contact']['phone'] ?? '',
                    $row['primary_contact']['email'] ?? '',
                    $row['main_address']['address'] ?? '',
                ], $data['suppliers'])
            ),
        ];

        $path = tempnam(sys_get_temp_dir(), 'report-');
        $zip = new ZipArchive();
        if ($zip->open($path, ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('failed to create xlsx file');
        }
        (new \App\Support\XlsxWriter())->write($zip, $sheets);
        $zip->close();

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="inventory-summary.xlsx"');
        header('Content-Length: ' . filesize($path));
        readfile($path);
        unlink($path);
    }
}
