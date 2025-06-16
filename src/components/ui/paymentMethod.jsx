"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CreditCard, Wallet } from "lucide-react";

export default function PaymentMethod({
  paymentMethod,
  setPaymentMethod,
  cardDetails,
  setCardDetails,
  isProcessing,
  handlePaymentSubmit,
}) {
  const [eWallet, setEWallet] = useState("");
  const [eWalletPhone, setEWalletPhone] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metode Pembayaran</CardTitle>
        <CardDescription>
          Pilih metode pembayaran yang diinginkan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePaymentSubmit}>
          <div className="space-y-6">
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="card" id="card" />
                <Label
                  htmlFor="card"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Kartu Kredit/Debit</p>
                    <p className="text-xs text-gray-500">
                      Visa, Mastercard, JCB
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="qris" id="qris" />
                <Label
                  htmlFor="qris"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <svg
                    className="h-5 w-5 text-green-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" />
                    <path d="M7 7h4v4H7V7zm0 6h4v4H7v-4zm6-6h4v4h-4V7zm0 6h4v4h-4v-4z" />
                  </svg>
                  <div>
                    <p className="font-medium">QRIS</p>
                    <p className="text-xs text-gray-500">Scan untuk membayar</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="ewallet" id="ewallet" />
                <Label
                  htmlFor="ewallet"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Wallet className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">E-Wallet</p>
                    <p className="text-xs text-gray-500">
                      GoPay, OVO, Dana, LinkAja
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="cash" id="cash" />
                <Label
                  htmlFor="cash"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <svg
                    className="h-5 w-5 text-green-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    <path d="M12.31 11.14c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                  <div>
                    <p className="font-medium">Tunai</p>
                    <p className="text-xs text-gray-500">Bayar di kasir</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === "card" && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Nomor Kartu</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Nama pada Kartu</Label>
                  <Input
                    id="cardName"
                    placeholder="NAMA LENGKAP"
                    value={cardDetails.cardName}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Tanggal Kadaluarsa</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          expiry: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      maxLength={4}
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, cvv: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "qris" && (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="bg-white p-2 border rounded-lg mb-4">
                  <img
                    src="/placeholder.svg?height=200&width=200"
                    alt="QRIS Code"
                    className="w-48 h-48 object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Scan kode QR di atas menggunakan aplikasi e-wallet atau mobile
                  banking Anda
                </p>
              </div>
            )}

            {paymentMethod === "ewallet" && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="ewalletType">Pilih E-Wallet</Label>
                  <Select value={eWallet} onValueChange={setEWallet}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih e-wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gopay">GoPay</SelectItem>
                      <SelectItem value="ovo">OVO</SelectItem>
                      <SelectItem value="dana">DANA</SelectItem>
                      <SelectItem value="linkaja">LinkAja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Nomor Telepon</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="08123456789"
                    value={eWalletPhone}
                    onChange={(e) => setEWalletPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === "cash" && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">
                      Pembayaran Tunai
                    </h4>
                    <p className="text-sm text-yellow-600">
                      Silakan lakukan pembayaran di kasir setelah menekan tombol
                      "Bayar Sekarang".
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button type="submit" className="w-full mt-6" disabled={isProcessing}>
            {isProcessing ? "Memproses..." : "Bayar Sekarang"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
