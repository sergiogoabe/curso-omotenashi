function field(id: string, value: string) {
  return id + value.length.toString().padStart(2, "0") + value
}

export function crc16(value: string) {
  let crc = 0xffff
  for (const char of value) {
    crc ^= char.charCodeAt(0) << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = ((crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

export function gerarPixPayload(value: number) {
  if (!Number.isFinite(value) || value <= 0) throw new Error("Valor PIX inválido")
  const payload = field("00", "01")
    + field("26", field("00", "BR.GOV.BCB.PIX") + field("01", "07030124600"))
    + field("52", "0000") + field("53", "986") + field("54", value.toFixed(2))
    + field("58", "BR") + field("59", "INFINITY AGENCIA") + field("60", "DIVINOPOLIS")
    + field("62", field("05", "***")) + "6304"
  return payload + crc16(payload)
}
