<?php

declare(strict_types=1);

namespace App\Services;

use App\Support\HttpClient;

final class ReportService
{
    private HttpClient $client;

    public function __construct(
        private readonly string $itemServiceUrl,
        private readonly string $supplierServiceUrl,
        private readonly string $stockServiceUrl,
    ) {
        $this->client = new HttpClient();
    }

    public function summary(string $authorization): array
    {
        $items = $this->client->json($this->itemServiceUrl . '/items', $authorization);
        $suppliers = $this->client->json($this->supplierServiceUrl . '/suppliers', $authorization);
        $stocks = $this->client->json($this->stockServiceUrl . '/stock', $authorization);

        $itemsById = [];
        foreach ($items as $item) {
            $itemsById[(string) $item['id']] = $item;
        }

        $stockRows = [];
        foreach ($stocks as $stock) {
            $item = $itemsById[(string) $stock['item_id']] ?? null;
            $location = $stock['location']['name'] ?? '';
            $stockRows[] = [
                'item_id' => $stock['item_id'],
                'sku' => $item['sku'] ?? '',
                'item_name' => $item['name'] ?? 'Unknown item',
                'location' => $location,
                'quantity' => $stock['quantity'],
                'min_quantity' => $stock['min_quantity'],
                'status' => $stock['status'] ?? (((int) $stock['quantity'] <= (int) $stock['min_quantity']) ? 'LOW' : 'OK'),
            ];
        }

        return [
            'generated_at' => gmdate('c'),
            'totals' => [
                'items' => count($items),
                'suppliers' => count($suppliers),
                'stock_records' => count($stocks),
                'low_stock' => count(array_filter($stockRows, static fn (array $row): bool => $row['status'] === 'LOW')),
            ],
            'items' => $items,
            'suppliers' => array_map([$this, 'normalizeSupplier'], $suppliers),
            'stocks' => $stockRows,
        ];
    }

    private function normalizeSupplier(array $supplier): array
    {
        return [
            ...$supplier,
            'primary_contact' => $supplier['contacts'][0] ?? null,
            'main_address' => $supplier['addresses'][0] ?? null,
        ];
    }
}
