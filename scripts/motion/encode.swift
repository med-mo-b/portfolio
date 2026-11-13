// Encodes timestamped JPEG frames into a constant-frame-rate H.264 MP4.
// Usage: swift encode.swift <framesDir> <out.mp4> [fps]
// framesDir holds frame_<n>.jpg plus frames.txt with "<file> <seconds>" per line.
import AVFoundation
import AppKit
import Foundation

let args = CommandLine.arguments
guard args.count >= 3 else { fatalError("usage: encode.swift <framesDir> <out.mp4> [fps]") }
let dir = URL(fileURLWithPath: args[1])
let out = URL(fileURLWithPath: args[2])
let fps = args.count > 3 ? Int32(args[3])! : 25

let index = try String(contentsOf: dir.appendingPathComponent("frames.txt"), encoding: .utf8)
let frames: [(String, Double)] = index.split(separator: "\n").compactMap { line in
  let parts = line.split(separator: " ")
  guard parts.count == 2, let t = Double(parts[1]) else { return nil }
  return (String(parts[0]), t)
}
guard let first = frames.first, let firstImage = NSImage(contentsOf: dir.appendingPathComponent(first.0)),
  let firstCg = firstImage.cgImage(forProposedRect: nil, context: nil, hints: nil)
else { fatalError("no frames") }
let width = firstCg.width - firstCg.width % 2
let height = firstCg.height - firstCg.height % 2

try? FileManager.default.removeItem(at: out)
let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: width,
  AVVideoHeightKey: height,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 6_000_000, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel],
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
  kCVPixelBufferWidthKey as String: width,
  kCVPixelBufferHeightKey as String: height,
])
writer.add(input)
guard writer.startWriting() else { fatalError("encode failed: \(String(describing: writer.error))") }
writer.startSession(atSourceTime: .zero)

func buffer(for cg: CGImage) -> CVPixelBuffer {
  var pb: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
  let b = pb!
  CVPixelBufferLockBaseAddress(b, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(b), width: width, height: height, bitsPerComponent: 8,
    bytesPerRow: CVPixelBufferGetBytesPerRow(b), space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
  ctx.interpolationQuality = .high
  ctx.draw(cg, in: CGRect(x: 0, y: 0, width: width, height: height))
  CVPixelBufferUnlockBaseAddress(b, [])
  return b
}

// Each output frame shows the latest captured frame at or before its time.
let t0 = first.1
let total = frames.last!.1 - t0 + 1.0 / Double(fps)
let count = Int(total * Double(fps))
var next = 0
var current: CVPixelBuffer? = nil
for i in 0..<count {
  let t = Double(i) / Double(fps)
  var advanced = false
  while next < frames.count && frames[next].1 - t0 <= t { next += 1; advanced = true }
  if advanced || current == nil {
    autoreleasepool {
      let file = frames[max(next - 1, 0)].0
      if let img = NSImage(contentsOf: dir.appendingPathComponent(file)),
        let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) { current = buffer(for: cg) }
    }
  }
  while !input.isReadyForMoreMediaData {
    if writer.status == .failed { fatalError("encode failed: \(String(describing: writer.error))") }
    usleep(2000)
  }
  if !adaptor.append(current!, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps)) {
    fatalError("encode failed: \(String(describing: writer.error))")
  }
}
input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
if writer.status != .completed { fatalError("encode failed: \(String(describing: writer.error))") }
print("wrote \(out.path) \(width)x\(height) \(count) frames")
