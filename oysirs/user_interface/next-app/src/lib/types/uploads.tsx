import {BaseProps} from "./base";


export interface UploadProps extends BaseProps {
    year: string;
    bank: string;
    status: "pending" | "in_progress" | "completed" | "failed";
    progress: number; // 0 to 100
    message: string;
}


export interface UploadListProps {
  uploads: UploadProps[];
//   total_count: number;
//   offset: number;
//   limit: number;
}

export interface UploadUrlProps {
    url: string;
}