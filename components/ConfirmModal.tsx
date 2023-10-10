import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { FC, ReactNode, useState } from "react"
import Button from "./Button"

const ConfirmModal: FC<Props> = ({ onClose, message, title }) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Dialog open onClose={() => onClose(false)}>
      <DialogTitle>{title ? title : "Aktion bestätigen"}</DialogTitle>
      <DialogContent className="p-4">
        <p className="mb-4 text-lg">{message}</p>
      </DialogContent>
      <DialogActions className="flex w-full p-6">
        <Button
          className="mr-2 w-full"
          isLoading={isLoading}
          onClick={async () => {
            setIsLoading(true)
            await onClose(true)
            setIsLoading(false)
          }}
        >
          Confirm
        </Button>
        <Button
          className="ml-2 w-full"
          onClick={() => onClose(false)}
          variant="secondary"
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmModal

interface Props {
  onClose: (confirm: boolean) => void | Promise<void>
  message: ReactNode
  title?: string
}
