DELIMITER $$

CREATE TRIGGER updation_on_rent
    AFTER INSERT ON borrowers FOR EACH ROW
    BEGIN
        UPDATE books
        SET total = total-1
        WHERE bid = NEW.book_id;
    END;
$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER delete_from_borrowers
    AFTER INSERT ON returns FOR EACH ROW
    BEGIN
        DELETE FROM borrowers
        WHERE member_id = NEW.member_id AND book_id = NEW.book_id;
    END;
$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER add_total
    AFTER INSERT ON returns FOR EACH ROW
    BEGIN
        UPDATE books
        SET total = total+1
        WHERE bid = NEW.book_id;
    END;
$$

DELIMITER ;
