import ContactMessageShow from './show';

/**
 * 編輯頁面沿用詳情頁，提供相同的狀態調整與刪除功能
 */
export default function ContactMessageEdit(props: Parameters<typeof ContactMessageShow>[0]) {
    return <ContactMessageShow {...props} />;
}
