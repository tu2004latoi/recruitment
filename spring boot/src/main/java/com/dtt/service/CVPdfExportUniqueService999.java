package com.dtt.service;

import com.dtt.dto.ApplicantDTO;
import com.dtt.dto.EducationDTO;
import com.dtt.dto.LocationDTO;
import com.dtt.dto.UserDTO;
import com.dtt.model.Institution;
import com.dtt.model.Level;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.net.URL;
import java.util.List;

@Service
public class CVPdfExportUniqueService999 {
    @Autowired
    private InstitutionService institutionService;

    @Autowired
    private LevelService levelService;

    private Font loadArial(String fontFile, float size, int style, BaseColor color) throws Exception {
        String fontPath = new File("src/main/resources/fonts/" + fontFile).getAbsolutePath();
        BaseFont baseFont = BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        return new Font(baseFont, size, style, color);
    }

    public byte[] generateCV(UserDTO userDTO,
                             ApplicantDTO applicantDTO,
                             LocationDTO locationDTO,
                             List<EducationDTO> educations) throws Exception {

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(document, out);
        document.open();

        // ===== Fonts =====
        Font nameFont = loadArial("arialbd.ttf", 28, Font.BOLD, BaseColor.WHITE);
        Font titleFont = loadArial("arial.ttf", 14, Font.NORMAL, BaseColor.WHITE);
        Font sectionFont = loadArial("arialbd.ttf", 14, Font.BOLD, new BaseColor(44, 62, 80));
        Font normalFont = loadArial("arial.ttf", 11, Font.NORMAL, BaseColor.BLACK);
        Font smallWhiteFont = loadArial("arial.ttf", 10, Font.NORMAL, BaseColor.WHITE);

        // ===== HEADER =====
        PdfPTable headerTable = new PdfPTable(new float[]{70, 30});
        headerTable.setWidthPercentage(100);

        PdfPCell nameCell = new PdfPCell();
        nameCell.setBackgroundColor(new BaseColor(52, 152, 219));
        nameCell.setPadding(20f);
        nameCell.setBorder(Rectangle.NO_BORDER);

        Paragraph name = new Paragraph(userDTO.getFirstName() + " " + userDTO.getLastName(), nameFont);
        Paragraph jobTitle = new Paragraph(applicantDTO.getJobTitle() != null ? applicantDTO.getJobTitle() : "Ứng viên", titleFont);

        name.setSpacingAfter(5f);
        nameCell.addElement(name);
        nameCell.addElement(jobTitle);

        headerTable.addCell(nameCell);

        // Avatar
        PdfPCell avatarCell = new PdfPCell();
        avatarCell.setBackgroundColor(new BaseColor(52, 152, 219));
        avatarCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        avatarCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        avatarCell.setBorder(Rectangle.NO_BORDER);

        try {
            if (userDTO.getAvatar() != null) {
                Image avatar = Image.getInstance(new URL(userDTO.getAvatar()));
                avatar.scaleAbsolute(80, 80);
                avatar.setAlignment(Element.ALIGN_CENTER);
                avatarCell.addElement(avatar);
            }
        } catch (Exception e) {
            // bỏ qua nếu không có avatar
        }

        headerTable.addCell(avatarCell);
        document.add(headerTable);

        document.add(Chunk.NEWLINE);

        // ===== MAIN CONTENT =====
        PdfPTable mainTable = new PdfPTable(new float[]{35, 65});
        mainTable.setWidthPercentage(100);

        // --- LEFT COLUMN ---
        PdfPCell leftCell = new PdfPCell();
        leftCell.setBackgroundColor(new BaseColor(236, 240, 241));
        leftCell.setPadding(12f);
        leftCell.setBorder(Rectangle.NO_BORDER);

        // Contact info
        leftCell.addElement(new Paragraph("Thông tin liên hệ", sectionFont));
        leftCell.addElement(new Paragraph("Email: " + userDTO.getEmail(), normalFont));
        leftCell.addElement(new Paragraph("Điện thoại: " + userDTO.getPhone(), normalFont));
        String address = String.format("%s, %s, %s",
                locationDTO.getAddress(),
                locationDTO.getDistrict(),
                locationDTO.getProvince());
        leftCell.addElement(new Paragraph("Địa chỉ: " + address, normalFont));
        leftCell.addElement(Chunk.NEWLINE);

        // Skills
        leftCell.addElement(new Paragraph("Kỹ năng", sectionFont));
        if (applicantDTO.getSkills() != null) {
            String[] skills = applicantDTO.getSkills().split(",");
            for (String skill : skills) {
                Paragraph skillName = new Paragraph(skill.trim(), normalFont);
                leftCell.addElement(skillName);

                // Progress bar (màu xanh)
                PdfPTable bar = new PdfPTable(1);
                PdfPCell barCell = new PdfPCell();
                barCell.setFixedHeight(6f);
                barCell.setBackgroundColor(new BaseColor(52, 152, 219));
                barCell.setBorder(Rectangle.NO_BORDER);
                bar.addCell(barCell);
                leftCell.addElement(bar);
                leftCell.addElement(Chunk.NEWLINE);
            }
        }
        mainTable.addCell(leftCell);

        // --- RIGHT COLUMN ---
        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setPadding(12f);

        // Bio
        rightCell.addElement(new Paragraph("Giới thiệu", sectionFont));
        rightCell.addElement(new Paragraph(applicantDTO.getBio() != null ? applicantDTO.getBio() : "", normalFont));
        rightCell.addElement(Chunk.NEWLINE);

        // Education timeline
        rightCell.addElement(new Paragraph("Học vấn", sectionFont));
        for (EducationDTO edu : educations) {
            Paragraph eduTitle = new Paragraph(edu.getYear() + " - " + edu.getTitle(), loadArial("arialbd.ttf", 12, Font.BOLD, BaseColor.BLACK));
            Level level = this.levelService.getLevelById(edu.getLevelId());
            Institution institution = this.institutionService.getInstitutionById(edu.getInstitutionId());
            Paragraph eduSchool = new Paragraph("Trường: " + institution.getName(), normalFont);
            Paragraph eduLevel = new Paragraph("Trình độ: " + level.getName(), normalFont);
            eduTitle.setSpacingBefore(5f);
            rightCell.addElement(eduTitle);
            rightCell.addElement(eduSchool);
            rightCell.addElement(eduLevel);
        }

        mainTable.addCell(rightCell);

        document.add(mainTable);
        document.close();
        return out.toByteArray();
    }
}
