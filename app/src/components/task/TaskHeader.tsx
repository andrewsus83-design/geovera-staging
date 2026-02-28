"use client";
import { useState } from "react";
import { Modal } from "../ui/modal";
import { useModal } from "../../hooks/useModal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Image from "next/image";

export default function TaskHeader() {
  const [selectedTaskGroup, setSelectedTaskGroup] = useState<string>("All");
  const { isOpen, openModal, closeModal } = useModal();
  const [message, setMessage] = useState("");

  const taskGroups = [
    { name: "All Tasks", key: "All", count: 14 },
    { name: "To do", key: "Todo", count: 3 },
    { name: "In Progress", key: "InProgress", count: 4 },
    { name: "Completed", key: "Completed", count: 4 },
  ];

  const handleMessageChange = (value: string) => {
    setMessage(value);
  };

  return (
    <>
      <div style={{ padding: "20px 24px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Tab pills row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "4px",
                borderRadius: "var(--gv-radius-sm)",
                background: "var(--gv-color-neutral-100)",
                padding: "3px",
              }}
            >
              {taskGroups.map((group) => {
                const active = selectedTaskGroup === group.key;
                return (
                  <button
                    key={group.key}
                    onClick={() => setSelectedTaskGroup(group.key)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      borderRadius: "var(--gv-radius-xs)",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--gv-font-body)",
                      fontSize: "14px",
                      fontWeight: 500,
                      transition: "all var(--gv-duration-fast) var(--gv-easing-default)",
                      background: active ? "var(--gv-color-bg-surface)" : "transparent",
                      color: active ? "var(--gv-color-neutral-900)" : "var(--gv-color-neutral-500)",
                      boxShadow: active ? "var(--gv-shadow-card)" : "none",
                    }}
                  >
                    {group.name}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--gv-radius-full)",
                        padding: "0 8px",
                        height: "22px",
                        fontSize: "12px",
                        fontWeight: 500,
                        background: active ? "var(--gv-color-primary-50)" : "var(--gv-color-bg-surface)",
                        color: active ? "var(--gv-color-primary-700)" : "var(--gv-color-neutral-400)",
                      }}
                    >
                      {group.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                className="gv-btn-secondary"
                style={{ height: "40px", fontSize: "14px", padding: "0 16px" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.0826 4.0835C11.0769 4.0835 10.2617 4.89871 10.2617 5.90433C10.2617 6.90995 11.0769 7.72516 12.0826 7.72516C13.0882 7.72516 13.9034 6.90995 13.9034 5.90433C13.9034 4.89871 13.0882 4.0835 12.0826 4.0835ZM2.29004 6.65409H8.84671C9.18662 8.12703 10.5063 9.22516 12.0826 9.22516C13.6588 9.22516 14.9785 8.12703 15.3184 6.65409H17.7067C18.1209 6.65409 18.4567 6.31831 18.4567 5.90409C18.4567 5.48988 18.1209 5.15409 17.7067 5.15409H15.3183C14.9782 3.68139 13.6586 2.5835 12.0826 2.5835C10.5065 2.5835 9.18691 3.68139 8.84682 5.15409H2.29004C1.87583 5.15409 1.54004 5.48988 1.54004 5.90409C1.54004 6.31831 1.87583 6.65409 2.29004 6.65409ZM4.6816 13.3462H2.29085C1.87664 13.3462 1.54085 13.682 1.54085 14.0962C1.54085 14.5104 1.87664 14.8462 2.29085 14.8462H4.68172C5.02181 16.3189 6.34142 17.4168 7.91745 17.4168C9.49348 17.4168 10.8131 16.3189 11.1532 14.8462H17.7075C18.1217 14.8462 18.4575 14.5104 18.4575 14.0962C18.4575 13.682 18.1217 13.3462 17.7075 13.3462H11.1533C10.8134 11.8733 9.49366 10.7752 7.91745 10.7752C6.34124 10.7752 5.02151 11.8733 4.6816 13.3462ZM9.73828 14.096C9.73828 13.0904 8.92307 12.2752 7.91745 12.2752C6.91183 12.2752 6.09662 13.0904 6.09662 14.096C6.09662 15.1016 6.91183 15.9168 7.91745 15.9168C8.92307 15.9168 9.73828 15.1016 9.73828 14.096Z"
                    fill="currentColor"
                  />
                </svg>
                Filter & Sort
              </button>
              <button className="gv-btn-sm" onClick={openModal}>
                Add New Task
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.2502 4.99951C9.2502 4.5853 9.58599 4.24951 10.0002 4.24951C10.4144 4.24951 10.7502 4.5853 10.7502 4.99951V9.24971H15.0006C15.4148 9.24971 15.7506 9.5855 15.7506 9.99971C15.7506 10.4139 15.4148 10.7497 15.0006 10.7497H10.7502V15.0001C10.7502 15.4143 10.4144 15.7501 10.0002 15.7501C9.58599 15.7501 9.2502 15.4143 9.2502 15.0001V10.7497H5C4.58579 10.7497 4.25 10.4139 4.25 9.99971C4.25 9.5855 4.58579 9.24971 5 9.24971H9.2502V4.99951Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] m-4"
      >
        <div style={{ padding: "32px" }}>
          <h4
            style={{
              fontFamily: "var(--gv-font-heading)",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--gv-color-neutral-900)",
              marginBottom: "4px",
            }}
          >
            Add a new task
          </h4>
          <p
            style={{
              fontFamily: "var(--gv-font-body)",
              fontSize: "14px",
              color: "var(--gv-color-neutral-500)",
              marginBottom: "24px",
            }}
          >
            Effortlessly manage your to-do list: add a new task
          </p>

          <form className="flex flex-col">
            <div className="custom-scrollbar" style={{ maxHeight: "450px", overflowY: "auto" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Task Title</Label>
                  <Input type="text" />
                </div>

                <div>
                  <Label>Due Date</Label>
                  <div className="relative">
                    <Input type="date" placeholder="Select date" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.33317 0.0830078C4.74738 0.0830078 5.08317 0.418794 5.08317 0.833008V1.24967H8.9165V0.833008C8.9165 0.418794 9.25229 0.0830078 9.6665 0.0830078C10.0807 0.0830078 10.4165 0.418794 10.4165 0.833008V1.24967L11.3332 1.24967C12.2997 1.24967 13.0832 2.03318 13.0832 2.99967V4.99967V11.6663C13.0832 12.6328 12.2997 13.4163 11.3332 13.4163H2.6665C1.70001 13.4163 0.916504 12.6328 0.916504 11.6663V4.99967V2.99967C0.916504 2.03318 1.70001 1.24967 2.6665 1.24967L3.58317 1.24967V0.833008C3.58317 0.418794 3.91896 0.0830078 4.33317 0.0830078ZM4.33317 2.74967H2.6665C2.52843 2.74967 2.4165 2.8616 2.4165 2.99967V4.24967H11.5832V2.99967C11.5832 2.8616 11.4712 2.74967 11.3332 2.74967H9.6665H4.33317ZM11.5832 5.74967H2.4165V11.6663C2.4165 11.8044 2.52843 11.9163 2.6665 11.9163H11.3332C11.4712 11.9163 11.5832 11.8044 11.5832 11.6663V5.74967Z"
                          fill="var(--gv-color-neutral-700)"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    className="gv-input"
                    style={{ appearance: "none", paddingRight: "40px" }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <Label>Tags</Label>
                  <select
                    className="gv-input"
                    style={{ appearance: "none", paddingRight: "40px" }}
                  >
                    <option value="marketing">Marketing</option>
                    <option value="template">Template</option>
                    <option value="development">Development</option>
                  </select>
                </div>

                <div>
                  <Label>Assignees</Label>
                  <select
                    className="gv-input"
                    style={{ appearance: "none", paddingRight: "40px" }}
                  >
                    <option value="1">Mayad Ahmed</option>
                    <option value="2">Juhan Ahamed</option>
                    <option value="3">Mahim Ahmed</option>
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Description</Label>
                  <TextArea
                    placeholder="Type your message here..."
                    rows={5}
                    value={message}
                    onChange={handleMessageChange}
                  />
                </div>
              </div>

              {/* Attachments */}
              <div
                style={{
                  marginTop: "24px",
                  padding: "20px",
                  border: "1px solid var(--gv-color-neutral-200)",
                  borderRadius: "var(--gv-radius-md)",
                  background: "var(--gv-color-neutral-50)",
                }}
              >
                <input type="file" id="upload-file" className="sr-only" />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--gv-font-heading)",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--gv-color-neutral-900)",
                    }}
                  >
                    Attachments
                  </span>
                  <span
                    style={{
                      width: "1px",
                      height: "16px",
                      background: "var(--gv-color-neutral-200)",
                    }}
                  />
                  <label
                    htmlFor="upload-file"
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--gv-color-primary-500)",
                      cursor: "pointer",
                    }}
                  >
                    Upload file
                  </label>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 16px 10px 12px",
                      border: "1px solid var(--gv-color-neutral-200)",
                      borderRadius: "var(--gv-radius-sm)",
                      background: "var(--gv-color-bg-surface)",
                    }}
                  >
                    <Image width={40} height={40} src="/images/task/pdf.svg" alt="pdf" />
                    <div>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "var(--gv-color-neutral-900)",
                        }}
                      >
                        Guidelines.pdf
                      </p>
                      <span style={{ fontSize: "12px", color: "var(--gv-color-neutral-400)" }}>
                        PDF
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 16px 10px 12px",
                      border: "1px solid var(--gv-color-neutral-200)",
                      borderRadius: "var(--gv-radius-sm)",
                      background: "var(--gv-color-bg-surface)",
                    }}
                  >
                    <Image width={40} height={40} src="/images/task/google-drive.svg" alt="drive" />
                    <div>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "var(--gv-color-neutral-900)",
                        }}
                      >
                        Branding Assets
                      </p>
                      <span style={{ fontSize: "12px", color: "var(--gv-color-neutral-400)" }}>
                        Media
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "60px",
                      height: "60px",
                      border: "1px solid var(--gv-color-neutral-200)",
                      borderRadius: "var(--gv-radius-sm)",
                      background: "var(--gv-color-bg-surface)",
                      color: "var(--gv-color-neutral-500)",
                      cursor: "pointer",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.2502 5.99951C11.2502 5.5853 11.586 5.24951 12.0002 5.24951C12.4145 5.24951 12.7502 5.5853 12.7502 5.99951V11.2498H18.0007C18.4149 11.2498 18.7507 11.5855 18.7507 11.9998C18.7507 12.414 18.4149 12.7498 18.0007 12.7498H12.7502V18.0002C12.7502 18.4144 12.4145 18.7502 12.0002 18.7502C11.586 18.7502 11.2502 18.4144 11.2502 18.0002V12.7498H6C5.58579 12.7498 5.25 12.414 5.25 11.9998C5.25 11.5855 5.58579 11.2498 6 11.2498H11.2502V5.99951Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "24px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontSize: "14px",
                    color: "var(--gv-color-neutral-500)",
                  }}
                >
                  Viewers:
                </span>
                <div className="flex -space-x-2">
                  {["/images/user/user-13.jpg", "/images/user/user-14.jpg", "/images/user/user-15.jpg"].map((src, i) => (
                    <div
                      key={i}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--gv-radius-full)",
                        overflow: "hidden",
                        border: "2px solid var(--gv-color-bg-surface)",
                      }}
                    >
                      <Image width={32} height={32} src={src} alt="user" />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={closeModal}
                  type="button"
                  className="gv-btn-secondary"
                  style={{ height: "40px", fontSize: "14px", padding: "0 20px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  type="button"
                  className="gv-btn-sm"
                >
                  Create Task
                </button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
