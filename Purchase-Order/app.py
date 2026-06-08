from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

STOCK_SERVICE_URL = os.getenv("STOCK_SERVICE_URL", "http://stock-service:3004")

purchase_orders = []
next_id = 1

VALID_STATUS = ["draft", "approved", "received", "cancelled"]


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Purchase Order Service running"
    })


@app.route("/purchase-orders", methods=["POST"])
def create_purchase_order():
    global next_id

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Body JSON wajib diisi"
        }), 400

    required_fields = ["supplier_id", "item_id", "quantity"]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "message": f"{field} wajib diisi"
            }), 400

    po = {
        "id": next_id,
        "supplier_id": int(data["supplier_id"]),
        "item_id": int(data["item_id"]),
        "quantity": int(data["quantity"]),
        "status": "draft"
    }

    purchase_orders.append(po)
    next_id += 1

    return jsonify({
        "message": "Purchase Order berhasil dibuat",
        "data": po
    }), 201


@app.route("/purchase-orders", methods=["GET"])
def get_purchase_orders():
    return jsonify({
        "data": purchase_orders
    })


@app.route("/purchase-orders/<int:po_id>", methods=["GET"])
def get_purchase_order_detail(po_id):
    po = find_po(po_id)

    if not po:
        return jsonify({
            "message": "Purchase Order tidak ditemukan"
        }), 404

    return jsonify({
        "data": po
    })


@app.route("/purchase-orders/<int:po_id>/status", methods=["PATCH"])
def update_purchase_order_status(po_id):
    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Body JSON wajib diisi"
        }), 400

    new_status = data.get("status")

    if new_status not in VALID_STATUS:
        return jsonify({
            "message": "Status tidak valid",
            "valid_status": VALID_STATUS
        }), 400

    po = find_po(po_id)

    if not po:
        return jsonify({
            "message": "Purchase Order tidak ditemukan"
        }), 404

    current_status = po["status"]

    if current_status == "cancelled":
        return jsonify({
            "message": "PO yang sudah cancelled tidak bisa diubah"
        }), 400

    if current_status == "received":
        return jsonify({
            "message": "PO yang sudah received tidak bisa diubah"
        }), 400

    if new_status == "received" and current_status != "approved":
        return jsonify({
            "message": "PO harus approved dulu sebelum received"
        }), 400

    po["status"] = new_status

    if new_status == "received":
        stock_response = add_stock_from_po(po)

        if not stock_response["success"]:
            po["status"] = current_status

            return jsonify({
                "message": "Gagal menambah stok ke stock-service",
                "error": stock_response["error"]
            }), 500

        po["stock_update"] = stock_response["data"]

    return jsonify({
        "message": "Status Purchase Order berhasil diubah",
        "data": po
    })


@app.route("/purchase-orders/supplier/<int:supplier_id>", methods=["GET"])
def get_po_history_by_supplier(supplier_id):
    history = [
        po for po in purchase_orders
        if int(po["supplier_id"]) == supplier_id
    ]

    return jsonify({
        "supplier_id": supplier_id,
        "total_po": len(history),
        "history": history
    })


def find_po(po_id):
    return next((po for po in purchase_orders if po["id"] == po_id), None)


def add_stock_from_po(po):
    try:
        auth_header = request.headers.get("Authorization", "")

        headers = {
            "Content-Type": "application/json"
        }

        if auth_header:
            headers["Authorization"] = auth_header

        stock_id_response = find_stock_by_item_id(po["item_id"], headers)

        if not stock_id_response["success"]:
            return stock_id_response

        stock_id = stock_id_response["stock_id"]

        response = requests.patch(
            f"{STOCK_SERVICE_URL}/stock/{stock_id}/adjust",
            json={
                "delta": po["quantity"],
                "reason_code": "PURCHASE_ORDER",
                "note": f"Stock added from purchase order #{po['id']}"
            },
            headers=headers,
            timeout=5
        )

        if response.status_code >= 400:
            return {
                "success": False,
                "error": response.text
            }

        return {
            "success": True,
            "data": response.json()
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def find_stock_by_item_id(item_id, headers):
    try:
        response = requests.get(
            f"{STOCK_SERVICE_URL}/stock",
            headers=headers,
            timeout=5
        )

        if response.status_code >= 400:
            return {
                "success": False,
                "error": response.text
            }

        stocks = response.json()

        for stock in stocks:
            if int(stock["item_id"]) == int(item_id):
                return {
                    "success": True,
                    "stock_id": stock["id"]
                }

        return {
            "success": False,
            "error": f"Stock untuk item_id {item_id} tidak ditemukan"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8003, debug=True)