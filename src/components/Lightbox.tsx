import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

export interface LightboxImage {
  src: string
  alt: string
}

interface LightboxProps {
  image: LightboxImage | null
  onClose: () => void
}

export function Lightbox({ image, onClose }: LightboxProps) {
  return (
    <Dialog
      open={Boolean(image)}
      onOpenChange={(value) => {
        if (!value) onClose()
      }}
    >
      <DialogContent className="max-h-[94svh] w-auto max-w-[94vw] border-0 bg-black p-0 shadow-none [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:opacity-80">
        <DialogTitle className="sr-only">{image?.alt || '이미지'}</DialogTitle>
        <DialogDescription className="sr-only">이미지</DialogDescription>
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            className="max-h-[94svh] w-auto max-w-[94vw] object-contain"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
