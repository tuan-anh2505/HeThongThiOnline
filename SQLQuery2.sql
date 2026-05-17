CREATE DATABASE HeThongThiOnline;
GO

USE HeThongThiOnline;
GO

CREATE TABLE TaiKhoan (
    MaTaiKhoan INT PRIMARY KEY IDENTITY(1,1),
    TenDangNhap VARCHAR(50) UNIQUE NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    SoDienThoai VARCHAR(15),
    VaiTro TINYINT NOT NULL,
    NgayTao DATETIME DEFAULT GETDATE()
);

CREATE TABLE CaThi (
    MaCaThi INT PRIMARY KEY IDENTITY(1,1),
    TenCaThi NVARCHAR(100),
    GioBatDau DATETIME,
    GioKetThuc DATETIME
);

CREATE TABLE NhatKyHeThong (
    MaLog INT PRIMARY KEY IDENTITY(1,1),
    MaTaiKhoan INT,
    HanhDong NVARCHAR(255),
    ThoiGian DATETIME DEFAULT GETDATE(),
    DiaChiIP VARCHAR(50),
    FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan)
);

CREATE TABLE GiangVien (
    MaGiangVien INT PRIMARY KEY,
    MaTaiKhoan INT UNIQUE,
    BoMon NVARCHAR(100),
    FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan)
);

CREATE TABLE SinhVien (
    MaSinhVien INT PRIMARY KEY,
    MaTaiKhoan INT UNIQUE,
    MaSoSinhVien VARCHAR(20) UNIQUE,
    NgaySinh DATE,
    FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan)
);

CREATE TABLE Lop (
    MaLop INT PRIMARY KEY IDENTITY(1,1),
    TenLop NVARCHAR(100) NOT NULL,
    NienKhoa VARCHAR(20),
    MaGiangVien INT,
    FOREIGN KEY (MaGiangVien) REFERENCES GiangVien(MaGiangVien)
);

CREATE TABLE MonThi (
    MaMonThi INT PRIMARY KEY IDENTITY(1,1),
    MaMon VARCHAR(50),
    TenMonThi NVARCHAR(100),
    SoTinChi INT,
    MoTa NVARCHAR(255),
    MaGiangVien INT, 
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaGiangVien) REFERENCES GiangVien(MaGiangVien)
);

CREATE TABLE NganHangCauHoi (
    MaNganHang INT PRIMARY KEY IDENTITY(1,1),
    TenNganHang NVARCHAR(255),
    MoTa NVARCHAR(MAX),
    MaGiangVien INT,
    FOREIGN KEY (MaGiangVien) REFERENCES GiangVien(MaGiangVien)
);

CREATE TABLE CauHoi (
    MaCauHoi INT PRIMARY KEY IDENTITY(1,1),
    MaNganHang INT,
    NoiDung NVARCHAR(MAX) NOT NULL,
    LoaiCauHoi TINYINT NOT NULL,
    Diem DECIMAL(5,2),
    FOREIGN KEY (MaNganHang) REFERENCES NganHangCauHoi(MaNganHang)
);

CREATE TABLE DapAnTracNghiem (
    MaDapAn INT PRIMARY KEY IDENTITY(1,1),
    MaCauHoi INT,
    NoiDungDapAn NVARCHAR(MAX),
    LaDapAnDung BIT,
    FOREIGN KEY (MaCauHoi) REFERENCES CauHoi(MaCauHoi)
);

CREATE TABLE DapAnDungSai (
    MaCauHoi INT PRIMARY KEY,
    DapAnDung BIT,
    FOREIGN KEY (MaCauHoi) REFERENCES CauHoi(MaCauHoi)
);

CREATE TABLE DapAnGhepTu (
    MaGhep INT PRIMARY KEY IDENTITY(1,1),
    MaCauHoi INT,
    VeTrai NVARCHAR(255),
    VePhai NVARCHAR(255),
    FOREIGN KEY (MaCauHoi) REFERENCES CauHoi(MaCauHoi)
);

CREATE TABLE DapAnDienChoTrong (
    MaDapAn INT PRIMARY KEY IDENTITY(1,1),
    MaCauHoi INT,
    TuKhoaDung NVARCHAR(255),
    FOREIGN KEY (MaCauHoi) REFERENCES CauHoi(MaCauHoi)
);

CREATE TABLE SinhVienLop (
    MaSinhVien INT,
    MaLop INT,
    PRIMARY KEY (MaSinhVien, MaLop),
    FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien),
    FOREIGN KEY (MaLop) REFERENCES Lop(MaLop)
);

CREATE TABLE SinhVienCaThi (
    MaSinhVien INT,
    MaCaThi INT,
    TrangThai NVARCHAR(50),
    PRIMARY KEY (MaSinhVien, MaCaThi),
    FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien),
    FOREIGN KEY (MaCaThi) REFERENCES CaThi(MaCaThi)
);

CREATE TABLE BaiThi (
    MaBaiThi INT PRIMARY KEY IDENTITY(1,1),
    TenBaiThi NVARCHAR(255),
    MaNganHang INT,
    MaLop INT,
    MaCaThi INT,
    MaMonThi INT, 
    ThoiLuong INT,
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNganHang) REFERENCES NganHangCauHoi(MaNganHang),
    FOREIGN KEY (MaLop) REFERENCES Lop(MaLop),
    FOREIGN KEY (MaCaThi) REFERENCES CaThi(MaCaThi),
    FOREIGN KEY (MaMonThi) REFERENCES MonThi(MaMonThi)
);

CREATE TABLE BaiLam (
    MaBaiLam INT PRIMARY KEY IDENTITY(1,1),
    MaSinhVien INT,
    MaBaiThi INT,
    ThoiGianBatDau DATETIME,
    ThoiGianNop DATETIME,
    DiemTong DECIMAL(5,2),
    FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien),
    FOREIGN KEY (MaBaiThi) REFERENCES BaiThi(MaBaiThi)
);

CREATE TABLE ChiTietBaiLam (
    MaChiTiet INT PRIMARY KEY IDENTITY(1,1),
    MaBaiLam INT,
    MaCauHoi INT,
    CauTraLoi NVARCHAR(MAX),
    DiemDatDuoc DECIMAL(5,2),
    FOREIGN KEY (MaBaiLam) REFERENCES BaiLam(MaBaiLam),
    FOREIGN KEY (MaCauHoi) REFERENCES CauHoi(MaCauHoi)
);

CREATE TABLE TrangThaiThi (
    MaTrangThai INT PRIMARY KEY IDENTITY(1,1),
    MaBaiLam INT,
    DangOnline BIT,
    LanCuoiHoatDong DATETIME,
    FOREIGN KEY (MaBaiLam) REFERENCES BaiLam(MaBaiLam)
);

CREATE TABLE ViPhamThi (
    MaViPham INT PRIMARY KEY IDENTITY(1,1),
    MaBaiLam INT,
    LoaiViPham NVARCHAR(255),
    ThoiGian DATETIME,
    FOREIGN KEY (MaBaiLam) REFERENCES BaiLam(MaBaiLam)
);