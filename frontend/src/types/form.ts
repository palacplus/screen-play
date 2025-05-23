import { ZodFormattedError } from "zod";
import { LoginRequest } from "./auth";
import { AuthContextProps } from "./auth";

export default interface LoginFormProps {
  data: LoginRequest,
  errors: ZodFormattedError<LoginRequest> | null,
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  onSubmit: (event: React.FormEvent) => void,
  onReset: (event: React.FormEvent) => void,
  authContext: AuthContextProps
  loading: boolean,
  active: boolean
}
