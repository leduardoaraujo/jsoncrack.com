import React from "react";
import type { ModalProps } from "@mantine/core";
import {
  ColorPicker,
  TextInput,
  SegmentedControl,
  Group,
  Modal,
  Button,
  Divider,
  ColorInput,
} from "@mantine/core";
import { toBlob, toJpeg, toPng, toSvg } from "html-to-image";
import { event as gaEvent } from "nextjs-google-analytics";
import toast from "react-hot-toast";
import { FiCopy, FiDownload } from "react-icons/fi";

enum Extensions {
  SVG = "svg",
  PNG = "png",
  JPEG = "jpeg",
}

const getDownloadFormat = (format: Extensions) => {
  switch (format) {
    case Extensions.SVG:
      return toSvg;
    case Extensions.PNG:
      return toPng;
    case Extensions.JPEG:
      return toJpeg;
  }
};

const swatches = [
  "#F2F3F4",
  "#181818",
  "#B80000",
  "#DB3E00",
  "#FCCB00",
  "#008B02",
  "#006B76",
  "#1273DE",
  "#004DCF",
  "#5300EB",
  "#EB9694",
  "#FAD0C3",
  "#FEF3BD",
  "#C1E1C5",
  "#BEDADC",
  "#C4DEF6",
  "#BED3F3",
  "#D4C4FB",
  "transparent",
];

function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");

  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const DownloadModal = ({ opened, onClose }: ModalProps) => {
  const [extension, setExtension] = React.useState(Extensions.PNG);
  const [fileDetails, setFileDetails] = React.useState({
    filename: " ",
    backgroundColor: "#F2F3F4",
    quality: 1,
  });

  const clipboardImage = async () => {
    try {
      toast.loading("Copiando para a área de transferência....", { id: "toastClipboard" });

      const imageElement = document.querySelector("svg[id*='ref']") as HTMLElement;

      const blob = await toBlob(imageElement, {
        quality: fileDetails.quality,
        backgroundColor: fileDetails.backgroundColor,
      });

      if (!blob) return;

      navigator.clipboard?.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      toast.success("Copiado para a área de transferência");
      gaEvent("clipboard_img");
    } catch (error) {
      toast.error("Falha ao copiar para a área de transferência");
    } finally {
      toast.dismiss("toastClipboard");
      onClose();
    }
  };

  const exportAsImage = async () => {
    try {
      toast.loading("Baixando...", { id: "toastDownload" });

      const imageElement = document.querySelector("svg[id*='ref']") as HTMLElement;

      const dataURI = await getDownloadFormat(extension)(imageElement, {
        quality: fileDetails.quality,
        backgroundColor: fileDetails.backgroundColor,
      });

      downloadURI(dataURI, `${fileDetails.filename}.${extension}`);
      gaEvent("download_img", { label: extension });
    } catch (error) {
      toast.error("Falha ao baixar a imagem!");
    } finally {
      toast.dismiss("toastDownload");
      onClose();
    }
  };

  const updateDetails = (key: keyof typeof fileDetails, value: string | number) =>
    setFileDetails({ ...fileDetails, [key]: value });

  return (
    <Modal opened={opened} onClose={onClose} title="Gerar Imagem do Diagrama" centered>
      <TextInput
        label="Nome do Arquivo"
        value={fileDetails.filename}
        onChange={e => updateDetails("filename", e.target.value)}
        mb="lg"
      />
      <SegmentedControl
        value={extension}
        onChange={e => setExtension(e as Extensions)}
        fullWidth
        data={[
          { label: "PNG", value: Extensions.PNG },
          { label: "JPEG", value: Extensions.JPEG },
          { label: "SVG", value: Extensions.SVG },
        ]}
        mb="lg"
      />
      <ColorInput
        label="Cor do Fundo"
        value={fileDetails.backgroundColor}
        onChange={color => updateDetails("backgroundColor", color)}
        withEyeDropper={false}
        mb="lg"
      />
      <ColorPicker
        format="rgba"
        value={fileDetails.backgroundColor}
        onChange={color => updateDetails("backgroundColor", color)}
        swatches={swatches}
        withPicker={false}
        fullWidth
      />
      <Divider my="xs" />
      <Group justify="right">
        <Button leftSection={<FiCopy />} onClick={clipboardImage}>
        Área de transferência
        </Button>
        <Button color="green" leftSection={<FiDownload />} onClick={exportAsImage}>
          Baixar
        </Button>
      </Group>
    </Modal>
  );
};
